from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User
from app.services.ticket_service import TicketService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    user = await db.get(User, int(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

def get_ticket_service(db: AsyncSession = Depends(get_db)) -> TicketService:
    return TicketService(db)