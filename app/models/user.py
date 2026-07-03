import enum
from sqlalchemy import String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.student)

    authored_tickets: Mapped[list["Ticket"]] = relationship(back_populates="student", foreign_keys="Ticket.student_id")
    assigned_tickets: Mapped[list["Ticket"]] = relationship(back_populates="teacher", foreign_keys="Ticket.teacher_id")