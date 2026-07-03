from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.ticket import TicketStatus
from app.schemas.ticket_entry import EntryOut

class TicketCreate(BaseModel):
    teacher_id: int
    content: str

class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    student_id: int
    teacher_id: int
    status: TicketStatus
    count: int                                  # <-- новое поле
    created_at: datetime
    updated_at: datetime

class TicketDetail(TicketOut):
    entries: list[EntryOut] = []