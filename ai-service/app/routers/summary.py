import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from groq import GroqError

from app.db import get_cursor
from app.groq_client import ask_json, MODEL
from app.schemas import SummaryResponse

router = APIRouter(prefix="/ai", tags=["ai"])

SUMMARY_SYSTEM_PROMPT = """You are a real estate analyst. Given property details as JSON,
respond ONLY with a JSON object with these exact keys:
- summary: a 2-3 sentence overview of the property
- pros: array of 3-5 short strings, key selling points
- cons: array of 2-4 short strings, honest drawbacks or considerations
- investment_score: integer 1-10 (10 = excellent investment)
- investment_note: 1-2 sentence rationale for the score

Be honest and specific, not generic. Base it only on the data given.
"""


def _fetch_property(property_id: str) -> dict | None:
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT "id", "title", "description", "propertyType", "price", "areaSqft",
                   "bedrooms", "bathrooms", "city", "state", "amenities",
                   "estimatedRentalMonthly", "maintenanceMonthly",
                   "annualAppreciationPercent", "updatedAt"
            FROM "properties"
            WHERE "id" = %s
            """,
            (property_id,),
        )
        return cur.fetchone()


def _fetch_cached_summary(property_id: str) -> dict | None:
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT "summary", "pros", "cons", "investmentScore", "investmentNote", "generatedAt"
            FROM "property_ai_summaries"
            WHERE "propertyId" = %s
            """,
            (property_id,),
        )
        return cur.fetchone()


def _upsert_summary(property_id: str, data: dict) -> None:
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO "property_ai_summaries"
                ("id", "propertyId", "summary", "pros", "cons", "investmentScore",
                 "investmentNote", "model", "generatedAt", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, now(), now(), now())
            ON CONFLICT ("propertyId") DO UPDATE SET
                "summary" = EXCLUDED."summary",
                "pros" = EXCLUDED."pros",
                "cons" = EXCLUDED."cons",
                "investmentScore" = EXCLUDED."investmentScore",
                "investmentNote" = EXCLUDED."investmentNote",
                "model" = EXCLUDED."model",
                "generatedAt" = now(),
                "updatedAt" = now()
            """,
            (
                str(uuid.uuid4()),
                property_id,
                data["summary"],
                data["pros"],
                data["cons"],
                data.get("investment_score"),
                data.get("investment_note"),
                MODEL,
            ),
        )


@router.post("/summary/{property_id}", response_model=SummaryResponse)
def ai_summary(property_id: str):
    prop = _fetch_property(property_id)
    if prop is None:
        raise HTTPException(status_code=404, detail="property not found")

    cached = _fetch_cached_summary(property_id)
    if cached and cached["generatedAt"] >= prop["updatedAt"]:
        return SummaryResponse(
            summary=cached["summary"],
            pros=cached["pros"],
            cons=cached["cons"],
            investment_score=cached["investmentScore"],
            investment_note=cached["investmentNote"],
            cached=True,
            generated_at=cached["generatedAt"].isoformat(),
        )

    prop_json = json.dumps(prop, default=str)
    try:
        data = ask_json(SUMMARY_SYSTEM_PROMPT, prop_json)
    except (GroqError, Exception) as e:
        if cached:
            # Groq is down but we have a stale cached summary — better than nothing.
            return SummaryResponse(
                summary=cached["summary"],
                pros=cached["pros"],
                cons=cached["cons"],
                investment_score=cached["investmentScore"],
                investment_note=cached["investmentNote"],
                cached=True,
                generated_at=cached["generatedAt"].isoformat(),
            )
        raise HTTPException(status_code=503, detail=f"AI summary unavailable: {e}")

    try:
        _upsert_summary(property_id, data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"failed to cache summary: {e}")

    return SummaryResponse(
        summary=data["summary"],
        pros=data["pros"],
        cons=data["cons"],
        investment_score=data.get("investment_score"),
        investment_note=data.get("investment_note"),
        cached=False,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )