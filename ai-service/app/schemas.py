from typing import Optional

from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str


class SearchFilters(BaseModel):
    bedrooms: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    city: Optional[str] = None
    property_type: Optional[str] = None


class SearchResponse(BaseModel):
    filters_used: SearchFilters
    ai_parsed: bool
    results: list[dict]


class SummaryResponse(BaseModel):
    summary: str
    pros: list[str]
    cons: list[str]
    investment_score: Optional[int] = None
    investment_note: Optional[str] = None
    cached: bool
    generated_at: str