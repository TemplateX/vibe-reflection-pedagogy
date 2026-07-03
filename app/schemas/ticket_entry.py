from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.ticket_entry import EntryType

class EntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ticket_id: int
    user_id: int
    role: str
    entry_type: EntryType
    content: str
    created_at: datetime

class FeedbackCreate(BaseModel):
    content: str

class RevisionCreate(BaseModel):
    content: str

class AcceptanceCreate(BaseModel):
    comment: str = ""