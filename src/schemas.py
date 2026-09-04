# Re-export from backend.schemas for backward compatibility
from backend.schemas import (
    BorrowerProfile,
    CreditScoreResponse,
    ConsentRequest,
    ConsentArtifactResponse,
    ConsentVerifyRequest,
    RawIngestionPayload,
)

__all__ = [
    "BorrowerProfile",
    "CreditScoreResponse",
    "ConsentRequest",
    "ConsentArtifactResponse",
    "ConsentVerifyRequest",
    "RawIngestionPayload",
]
