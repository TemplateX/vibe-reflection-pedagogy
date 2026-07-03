from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.ticket import Ticket, TicketStatus
from app.models.ticket_entry import TicketEntry, EntryType
from fastapi import HTTPException, status
from sqlalchemy import select
from app.models.user import User, UserRole

class TicketService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ticket(self, student_id: int, teacher_id: int, content: str) -> Ticket:
        # Проверка существования учителя
        teacher = await self.db.get(User, teacher_id)
        if not teacher or teacher.role != UserRole.teacher:
            raise HTTPException(status_code=400, detail="Указанный учитель не найден")

        ticket = Ticket(student_id=student_id, teacher_id=teacher_id, count=4)
        self.db.add(ticket)
        await self.db.flush()

        entry = TicketEntry(
            ticket_id=ticket.id,
            user_id=student_id,
            role="student",
            entry_type=EntryType.submission,
            content=content
        )
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def add_feedback(self, ticket_id: int, teacher_id: int, content: str) -> Ticket:
        ticket = await self._get_ticket(ticket_id)
        self._check_teacher(ticket, teacher_id)
        if ticket.status == TicketStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Задание уже закрыто")
        ticket.status = TicketStatus.AWAITING_STUDENT
        ticket.count -= 1                               # уменьшаем счётчик
        entry = TicketEntry(
            ticket_id=ticket.id,
            user_id=teacher_id,
            role="teacher",
            entry_type=EntryType.feedback,
            content=content
        )
        self.db.add(entry)
        await self._maybe_auto_accept(ticket)           # проверка и автозакрытие
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def add_revision(self, ticket_id: int, student_id: int, content: str) -> Ticket:
        ticket = await self._get_ticket(ticket_id)
        if ticket.student_id != student_id:
            raise HTTPException(status_code=403, detail="Только автор может отправлять доработку")
        if ticket.status != TicketStatus.AWAITING_STUDENT:
            raise HTTPException(status_code=400, detail="Сейчас нельзя отправить доработку (ожидается статус AWAITING_STUDENT)")
        ticket.status = TicketStatus.AWAITING_TEACHER
        ticket.count -= 1                               # уменьшаем счётчик
        entry = TicketEntry(
            ticket_id=ticket.id,
            user_id=student_id,
            role="student",
            entry_type=EntryType.revision,
            content=content
        )
        self.db.add(entry)
        await self._maybe_auto_accept(ticket)           # проверка и автозакрытие
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def accept_ticket(self, ticket_id: int, teacher_id: int, comment: str = "") -> Ticket:
        ticket = await self._get_ticket(ticket_id)
        self._check_teacher(ticket, teacher_id)
        if ticket.status == TicketStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Задание уже закрыто")
        if ticket.status != TicketStatus.AWAITING_TEACHER:
            raise HTTPException(status_code=400, detail="Принять задание можно только после отправки студентом")
        ticket.status = TicketStatus.COMPLETED
        # при ручном принятии счётчик не меняется
        entry = TicketEntry(
            ticket_id=ticket.id,
            user_id=teacher_id,
            role="teacher",
            entry_type=EntryType.acceptance,
            content=comment or "Задание принято"
        )
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def get_ticket(self, ticket_id: int, user_id: int) -> Ticket:
        ticket = await self._get_ticket(ticket_id)
        if user_id not in (ticket.student_id, ticket.teacher_id):
            raise HTTPException(status_code=403, detail="Нет доступа к этому заданию")
        return ticket

    async def list_user_tickets(self, user_id: int, role: str, status_filter: str | None = None):
        if role == "student":
            query = select(Ticket).where(Ticket.student_id == user_id)
        else:
            query = select(Ticket).where(Ticket.teacher_id == user_id)
        if status_filter:
            query = query.where(Ticket.status == status_filter)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def _maybe_auto_accept(self, ticket: Ticket):
        """Если счётчик дошёл до 0, автоматически закрываем тикет."""
        if ticket.count <= 0:
            ticket.status = TicketStatus.COMPLETED
            entry = TicketEntry(
                ticket_id=ticket.id,
                user_id=ticket.teacher_id,          # можно системного пользователя, но проще учителя
                role="teacher",
                entry_type=EntryType.acceptance,
                content="Автоматически закрыто (достигнут лимит циклов)"
            )
            self.db.add(entry)

    async def _get_ticket(self, ticket_id: int) -> Ticket:
        query = select(Ticket).where(Ticket.id == ticket_id).options(selectinload(Ticket.entries))
        result = await self.db.execute(query)
        ticket = result.scalar_one_or_none()
        if not ticket:
            raise HTTPException(status_code=404, detail="Тикет не найден")
        return ticket

    def _check_teacher(self, ticket: Ticket, teacher_id: int):
        if ticket.teacher_id != teacher_id:
            raise HTTPException(status_code=403, detail="Вы не назначены проверяющим этого задания")