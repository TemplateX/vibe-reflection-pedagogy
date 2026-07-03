from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketOut, TicketDetail
from app.schemas.ticket_entry import FeedbackCreate, RevisionCreate, AcceptanceCreate
from app.api.deps import get_current_user, get_ticket_service
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.post("/", response_model=TicketOut, status_code=201)
async def create_ticket(
    data: TicketCreate,
    current_user: User = Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Только ученики могут создавать задания")
    ticket = await service.create_ticket(
        student_id=current_user.id,
        teacher_id=data.teacher_id,
        content=data.content
    )
    return ticket

@router.get("/", response_model=list[TicketOut])
async def list_tickets(
    status_filter: str | None = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service)
):
    return await service.list_user_tickets(
        user_id=current_user.id,
        role=current_user.role,
        status_filter=status_filter
    )

@router.get("/{ticket_id}", response_model=TicketDetail)
async def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service)
):
    ticket = await service.get_ticket(ticket_id, current_user.id)
    return ticket

@router.post("/{ticket_id}/feedback", response_model=TicketOut)
async def add_feedback(
    ticket_id: int,
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Только учитель может давать обратную связь")
    return await service.add_feedback(ticket_id, current_user.id, data.content)

@router.post("/{ticket_id}/revision", response_model=TicketOut)
async def add_revision(
    ticket_id: int,
    data: RevisionCreate,
    current_user: User = Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Только ученик может отправлять доработку")
    return await service.add_revision(ticket_id, current_user.id, data.content)

@router.post("/{ticket_id}/accept", response_model=TicketOut)
async def accept_ticket(
    ticket_id: int,
    data: AcceptanceCreate,
    current_user: User = Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Только учитель может принять задание")
    return await service.accept_ticket(ticket_id, current_user.id, data.comment)