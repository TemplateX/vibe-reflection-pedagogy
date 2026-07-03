# app/models/ticket.py
import enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class TicketStatus(str, enum.Enum):
    AWAITING_TEACHER = "AWAITING_TEACHER"
    AWAITING_STUDENT = "AWAITING_STUDENT"
    COMPLETED = "COMPLETED"

class Ticket(Base):
    __tablename__ = "tickets"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[TicketStatus] = mapped_column(
        SAEnum(TicketStatus), default=TicketStatus.AWAITING_TEACHER
    )
    count: Mapped[int] = mapped_column(default=4)                    # <-- новое поле
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student: Mapped["User"] = relationship(back_populates="authored_tickets", foreign_keys=[student_id])
    teacher: Mapped["User"] = relationship(back_populates="assigned_tickets", foreign_keys=[teacher_id])
    entries: Mapped[list["TicketEntry"]] = relationship(back_populates="ticket", order_by="TicketEntry.created_at")