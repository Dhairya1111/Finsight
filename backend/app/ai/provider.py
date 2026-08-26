from __future__ import annotations

import re
from abc import ABC, abstractmethod

import httpx

from app.core.config import Settings
from app.core.exceptions import ProviderError
from app.schemas.ai import AIAnalysisResponse


class AIProvider(ABC):
    @abstractmethod
    def analyze(self, question: str, context: str, references: list[str]) -> AIAnalysisResponse: ...


class FallbackAIProvider(AIProvider):
    def analyze(self, question: str, context: str, references: list[str]) -> AIAnalysisResponse:
        sentences = [segment.strip() for segment in re.split(r"(?<=[A-Za-z%])\.\s+", context) if segment.strip()]
        summary = ". ".join(sentences[:3]) if sentences else "No verified context was available for this request."
        bullets = sentences[:4] if sentences else ["No structured facts were available."]
        caveats = [
            "FinSight fallback mode uses deterministic templates rather than a remote LLM.",
            "Only data already available inside the application should be treated as evidence.",
        ]
        return AIAnalysisResponse(
            answer=summary,
            bullets=bullets,
            caveats=caveats,
            references=references,
            used_fallback=True,
        )


class OpenAICompatibleProvider(AIProvider):
    def __init__(self, settings: Settings) -> None:
        if not settings.openai_api_key or not settings.openai_base_url:
            raise ProviderError("Missing OPENAI_API_KEY or OPENAI_BASE_URL for AI provider.")
        self.base_url = settings.openai_base_url.rstrip("/")
        self.api_key = settings.openai_api_key
        self.temperature = settings.model_temperature

    def analyze(self, question: str, context: str, references: list[str]) -> AIAnalysisResponse:
        system_prompt = (
            "You are FinSight AI Analyst. Use only the supplied verified context. "
            "If data is missing, say so. Do not give personalized financial advice. "
            "Return concise analytical prose followed by 3-5 bullet points."
        )
        payload = {
            "model": "gpt-4o-mini",
            "temperature": self.temperature,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Question: {question}\n\nVerified context:\n{context}\n\nReferences: {references}",
                },
            ],
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = httpx.post(f"{self.base_url}/chat/completions", json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
        except Exception as exc:
            raise ProviderError("LLM provider request failed.") from exc
        lines = [line.strip("- ").strip() for line in content.splitlines() if line.strip()]
        answer = lines[0] if lines else content
        bullets = [line for line in lines[1:6] if line]
        return AIAnalysisResponse(
            answer=answer,
            bullets=bullets,
            caveats=["Remote LLM output may still require human verification."],
            references=references,
            used_fallback=False,
        )


def get_ai_provider(settings: Settings) -> AIProvider:
    if settings.ai_provider == "openai_compatible":
        try:
            return OpenAICompatibleProvider(settings)
        except ProviderError:
            return FallbackAIProvider()
    return FallbackAIProvider()
