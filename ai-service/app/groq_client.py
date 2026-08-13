import json

from groq import Groq

from app.config import settings

_client: Groq | None = None

MODEL = "llama-3.3-70b-versatile"


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def ask_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Calls Groq in JSON mode and returns a parsed dict.
    Raises on any failure (network, bad JSON, etc.) — caller decides how to
    degrade gracefully. Never silently returns a made-up result.
    """
    client = get_groq_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    content = response.choices[0].message.content
    return json.loads(content)