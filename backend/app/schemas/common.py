from __future__ import annotations

from pydantic import BaseModel


class SourceMeta(BaseModel):
    name: str
    url: str | None = None
    data_date: str | None = None
    last_updated: str | None = None
    is_demo: bool = False
    note: str | None = None


class ApiMessage(BaseModel):
    message: str
