from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.core.security import get_current_user

router = APIRouter(prefix="/logistics", tags=["Logistics"])


class UpdateAvailability(BaseModel):
    is_available: bool


class UpdateVehicle(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_plate: Optional[str] = None


class TrackingUpdate(BaseModel):
    latitude: float
    longitude: float


@router.get("/dashboard")
async def logistics_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "logistics":
        raise HTTPException(status_code=403, detail="Logistics only")

    # Pending pickups
    pending_stmt = select(func.count()).select_from(Order).where(
        Order.logistics_id == current_user.id,
        Order.status.in_([OrderStatus.assigned_logistics, OrderStatus.confirmed])
    )
    pending = (await db.execute(pending_stmt)).scalar() or 0

    # Active deliveries
    active_stmt = select(func.count()).select_from(Order).where(
        Order.logistics_id == current_user.id,
        Order.status.in_([OrderStatus.picked_up, OrderStatus.in_transit])
    )
    active = (await db.execute(active_stmt)).scalar() or 0

    # Completed
    completed_stmt = select(func.count()).select_from(Order).where(
        Order.logistics_id == current_user.id,
        Order.status == OrderStatus.delivered
    )
    completed = (await db.execute(completed_stmt)).scalar() or 0

    return {
        "pending_pickups": pending,
        "active_deliveries": active,
        "completed": completed,
        "total_earned": current_user.total_earned,
        "wallet_balance": current_user.wallet_balance,
        "is_available": current_user.is_available,
        "vehicle_type": current_user.vehicle_type,
        "vehicle_plate": current_user.vehicle_plate,
        "rating": current_user.rating,
    }


@router.get("/deliveries")
async def list_deliveries(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).where(Order.logistics_id == current_user.id)
    if status:
        stmt = stmt.where(Order.status == status)
    stmt = stmt.order_by(Order.created_at.desc())

    result = await db.execute(stmt)
    orders = result.scalars().all()

    responses = []
    for o in orders:
        buyer = await db.get(User, o.buyer_id)
        seller = await db.get(User, o.seller_id)
        responses.append({
            "id": o.id,
            "order_number": o.order_number,
            "status": o.status.value,
            "delivery_fee": o.delivery_fee,
            "pickup_address": o.pickup_address or (seller.address if seller else ""),
            "delivery_address": o.delivery_address,
            "buyer_name": f"{buyer.first_name} {buyer.last_name}" if buyer else "",
            "buyer_phone": buyer.phone if buyer else "",
            "seller_name": f"{seller.first_name} {seller.last_name}" if seller else "",
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })
    return responses


@router.put("/availability")
async def update_availability(
    data: UpdateAvailability,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.is_available = data.is_available
    await db.flush()
    return {"is_available": current_user.is_available}


@router.put("/vehicle")
async def update_vehicle(
    data: UpdateVehicle,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.vehicle_type:
        current_user.vehicle_type = data.vehicle_type
    if data.vehicle_plate:
        current_user.vehicle_plate = data.vehicle_plate
    await db.flush()
    return {"vehicle_type": current_user.vehicle_type, "vehicle_plate": current_user.vehicle_plate}


@router.put("/orders/{order_id}/accept")
async def accept_delivery(order_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order or order.logistics_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatus.picked_up
    await db.flush()
    return {"message": "Delivery accepted"}


@router.put("/orders/{order_id}/reject")
async def reject_delivery(order_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order or order.logistics_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    order.logistics_id = None
    order.status = OrderStatus.confirmed
    await db.flush()
    return {"message": "Delivery rejected"}


@router.put("/orders/{order_id}/track")
async def update_tracking(
    order_id: int,
    data: TrackingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)
    if not order or order.logistics_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    order.current_latitude = data.latitude
    order.current_longitude = data.longitude
    await db.flush()
    return {"message": "Location updated"}


@router.get("/earnings")
async def get_earnings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.transaction import Transaction, TransactionCategory
    stmt = select(Transaction).where(
        Transaction.user_id == current_user.id,
        Transaction.category == TransactionCategory.delivery_fee,
    ).order_by(Transaction.created_at.desc())
    result = await db.execute(stmt)
    txns = result.scalars().all()
    return [{
        "id": t.id,
        "amount": t.amount,
        "description": t.description,
        "status": t.status.value if hasattr(t.status, 'value') else str(t.status),
        "created_at": t.created_at.isoformat() if t.created_at else None,
    } for t in txns]


@router.get("/available")
async def list_available_logistics(db: AsyncSession = Depends(get_db)):
    """List all available logistics partners for assignment"""
    stmt = select(User).where(
        User.role == "logistics",
        User.is_available == True,
        User.is_active == True,
    ).order_by(User.rating.desc())

    result = await db.execute(stmt)
    partners = result.scalars().all()

    return [{
        "id": p.id,
        "name": f"{p.first_name} {p.last_name}",
        "phone": p.phone,
        "vehicle_type": p.vehicle_type,
        "rating": p.rating,
        "total_reviews": p.total_reviews,
        "state": p.state,
        "city": p.city,
    } for p in partners]
