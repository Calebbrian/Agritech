from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification, PriceAlert, SavedAddress, Wishlist
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["Notifications & User Data"])


# ===== NOTIFICATIONS =====
@router.get("/notifications")
async def list_notifications(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50)
    result = await db.execute(stmt)
    return [{
        "id": n.id, "title": n.title, "message": n.message, "type": n.type,
        "is_read": n.is_read, "link": n.link,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    } for n in result.scalars().all()]


@router.put("/notifications/{notif_id}/read")
async def mark_read(notif_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    n = await db.get(Notification, notif_id)
    if n and n.user_id == current_user.id:
        n.is_read = True
        await db.flush()
    return {"message": "Marked as read"}


@router.put("/notifications/read-all")
async def mark_all_read(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == current_user.id, Notification.is_read == False)
    result = await db.execute(stmt)
    for n in result.scalars().all():
        n.is_read = True
    await db.flush()
    return {"message": "All marked as read"}


@router.delete("/notifications/{notif_id}")
async def delete_notification(notif_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    n = await db.get(Notification, notif_id)
    if n and n.user_id == current_user.id:
        await db.delete(n)
        await db.flush()
    return {"message": "Deleted"}


# ===== PRICE ALERTS =====
class CreatePriceAlert(BaseModel):
    product_name: str
    target_price: int
    unit: str


@router.get("/price-alerts")
async def list_price_alerts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(PriceAlert).where(PriceAlert.user_id == current_user.id).order_by(PriceAlert.created_at.desc())
    result = await db.execute(stmt)
    return [{
        "id": a.id, "product_name": a.product_name, "target_price": a.target_price,
        "unit": a.unit, "is_active": a.is_active, "triggered": a.triggered,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    } for a in result.scalars().all()]


@router.post("/price-alerts", status_code=201)
async def create_price_alert(data: CreatePriceAlert, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    alert = PriceAlert(user_id=current_user.id, product_name=data.product_name, target_price=data.target_price, unit=data.unit)
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    return {"id": alert.id, "message": "Alert created"}


@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(alert_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    a = await db.get(PriceAlert, alert_id)
    if a and a.user_id == current_user.id:
        await db.delete(a)
        await db.flush()
    return {"message": "Deleted"}


@router.put("/price-alerts/{alert_id}/toggle")
async def toggle_price_alert(alert_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    a = await db.get(PriceAlert, alert_id)
    if a and a.user_id == current_user.id:
        a.is_active = not a.is_active
        await db.flush()
    return {"is_active": a.is_active if a else False}


# ===== SAVED ADDRESSES =====
class CreateAddress(BaseModel):
    label: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    is_default: bool = False


@router.get("/addresses")
async def list_addresses(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(SavedAddress).where(SavedAddress.user_id == current_user.id).order_by(SavedAddress.created_at.desc())
    result = await db.execute(stmt)
    return [{
        "id": a.id, "label": a.label, "address": a.address, "city": a.city,
        "state": a.state, "is_default": a.is_default,
    } for a in result.scalars().all()]


@router.post("/addresses", status_code=201)
async def create_address(data: CreateAddress, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    addr = SavedAddress(user_id=current_user.id, label=data.label, address=data.address, city=data.city, state=data.state, is_default=data.is_default)
    db.add(addr)
    await db.flush()
    await db.refresh(addr)
    return {"id": addr.id, "message": "Address saved"}


@router.delete("/addresses/{addr_id}")
async def delete_address(addr_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    a = await db.get(SavedAddress, addr_id)
    if a and a.user_id == current_user.id:
        await db.delete(a)
        await db.flush()
    return {"message": "Deleted"}


# ===== WISHLIST =====
@router.get("/wishlist")
async def list_wishlist(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from app.models.product import Product
    stmt = select(Wishlist).where(Wishlist.user_id == current_user.id)
    result = await db.execute(stmt)
    items = []
    for w in result.scalars().all():
        product = await db.get(Product, w.product_id)
        if product:
            items.append({"id": w.id, "product_id": product.id, "name": product.name, "price": product.price, "unit": product.unit})
    return items


@router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id))
    if existing.scalar_one_or_none():
        return {"message": "Already in wishlist"}
    db.add(Wishlist(user_id=current_user.id, product_id=product_id))
    await db.flush()
    return {"message": "Added to wishlist"}


@router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id)
    result = await db.execute(stmt)
    w = result.scalar_one_or_none()
    if w:
        await db.delete(w)
        await db.flush()
    return {"message": "Removed"}


# ===== LEADERBOARD =====
@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.role == "farmer", User.is_active == True).order_by(User.total_earned.desc()).limit(20)
    result = await db.execute(stmt)
    farmers = result.scalars().all()
    return [{
        "id": f.id,
        "name": f"{f.first_name} {f.last_name}",
        "avatar": f.first_name[0] if f.first_name else "?",
        "state": f.state,
        "rating": f.rating,
        "totalSold": f.total_earned,
        "products": 0,
        "verified": f.is_verified,
        "sustainabilityScore": f.sustainability_score,
    } for f in farmers]
