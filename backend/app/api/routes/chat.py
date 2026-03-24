from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import List
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User
from app.models.chat import Conversation, Message
from app.core.security import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/chat", tags=["Chat"])


class SendMessage(BaseModel):
    receiver_id: int
    content: str
    message_type: str = "text"


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    content: str
    message_type: str
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


@router.get("/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Conversation).where(
        or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id)
    ).order_by(Conversation.last_message_at.desc().nullslast())

    result = await db.execute(stmt)
    convos = result.scalars().all()

    responses = []
    for c in convos:
        other_id = c.user2_id if c.user1_id == current_user.id else c.user1_id
        other_user = await db.get(User, other_id)

        # Count unread
        unread_stmt = select(Message).where(
            Message.conversation_id == c.id,
            Message.sender_id != current_user.id,
            Message.is_read == False,
        )
        unread_result = await db.execute(unread_stmt)
        unread_count = len(unread_result.scalars().all())

        responses.append({
            "id": c.id,
            "other_user": {
                "id": other_user.id,
                "name": f"{other_user.first_name} {other_user.last_name}",
                "role": other_user.role.value,
                "avatar_url": other_user.avatar_url,
            } if other_user else None,
            "last_message": c.last_message,
            "last_message_at": c.last_message_at.isoformat() if c.last_message_at else None,
            "unread_count": unread_count,
        })
    return responses


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    convo = await db.get(Conversation, conversation_id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if convo.user1_id != current_user.id and convo.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Mark as read
    stmt = select(Message).where(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False,
    )
    result = await db.execute(stmt)
    for msg in result.scalars().all():
        msg.is_read = True

    # Fetch messages
    stmt = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).offset((page - 1) * limit).limit(limit)

    result = await db.execute(stmt)
    messages = result.scalars().all()

    return [{
        "id": m.id,
        "sender_id": m.sender_id,
        "content": m.content,
        "message_type": m.message_type,
        "is_read": m.is_read,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    } for m in reversed(messages)]


@router.post("/send")
async def send_message(
    data: SendMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Find or create conversation
    stmt = select(Conversation).where(
        or_(
            and_(Conversation.user1_id == current_user.id, Conversation.user2_id == data.receiver_id),
            and_(Conversation.user1_id == data.receiver_id, Conversation.user2_id == current_user.id),
        )
    )
    result = await db.execute(stmt)
    convo = result.scalar_one_or_none()

    if not convo:
        convo = Conversation(user1_id=current_user.id, user2_id=data.receiver_id)
        db.add(convo)
        await db.flush()

    msg = Message(
        conversation_id=convo.id,
        sender_id=current_user.id,
        content=data.content,
        message_type=data.message_type,
    )
    db.add(msg)

    convo.last_message = data.content
    convo.last_message_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(msg)

    return {
        "id": msg.id,
        "conversation_id": convo.id,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }
