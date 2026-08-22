from __future__ import annotations


class FinSightError(Exception):
    """Base domain exception."""


class ValidationError(FinSightError):
    """Raised when user supplied data fails validation."""


class ProviderError(FinSightError):
    """Raised when an external or demo provider cannot satisfy a request."""
