from datetime import datetime
from enum import Enum
from typing import Optional, Annotated

from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator, PlainSerializer, ConfigDict

# Pydantic v2-friendly ObjectId type
def _to_object_id(v):
    if v is None or isinstance(v, ObjectId):
        return v
    try:
        return ObjectId(str(v))
    except Exception:
        raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(_to_object_id),
    PlainSerializer(lambda v: str(v) if v is not None else None, return_type=str),
]

class RequestStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    UNRESOLVED = "unresolved"

# -------------- Database Schemas --------------

class HelpRequest(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,        # replaces allow_population_by_field_name
        arbitrary_types_allowed=True, # allow ObjectId
    )

    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    customer_id: str
    question: str
    status: RequestStatus = RequestStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    supervisor_answer: Optional[str] = None

class Knowledge(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    question_key: str
    answer: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
