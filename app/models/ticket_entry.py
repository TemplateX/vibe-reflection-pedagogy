import enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class EntryType(str, enum.Enum):
    submission = "submission"
    feedback = "feedback"
    revision = "revision"
    acceptance = "acceptance"

class TicketEntry(Base):
    __tablename__ = "ticket_entries"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String(10))
    entry_type: Mapped[EntryType] = mapped_column(SAEnum(EntryType))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    ticket: Mapped["Ticket"] = relationship(back_populates="entries")
    user: Mapped["User"] = relationship()