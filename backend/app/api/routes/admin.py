from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.transaction import Transaction
from app.models.agent_farmer import AgentFarmer, FarmerStatus
from app.core.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_orders = (await db.execute(select(func.count()).select_from(Order))).scalar() or 0
    total_products = (await db.execute(select(func.count()).select_from(Product).where(Product.is_active == True))).scalar() or 0
    total_revenue = (await db.execute(select(func.sum(Order.total_amount)).where(Order.payment_status == "released"))).scalar() or 0.0

    # Users by role
    farmers = (await db.execute(select(func.count()).select_from(User).where(User.role == "farmer"))).scalar() or 0
    agents = (await db.execute(select(func.count()).select_from(User).where(User.role == "agent"))).scalar() or 0
    buyers = (await db.execute(select(func.count()).select_from(User).where(User.role == "buyer"))).scalar() or 0
    logistics = (await db.execute(select(func.count()).select_from(User).where(User.role == "logistics"))).scalar() or 0

    pending_verifications = (await db.execute(
        select(func.count()).select_from(AgentFarmer).where(AgentFarmer.status == FarmerStatus.pending)
    )).scalar() or 0

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_revenue": total_revenue,
        "users_by_role": {"farmers": farmers, "agents": agents, "buyers": buyers, "logistics": logistics},
        "pending_verifications": pending_verifications,
    }


@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    if search:
        stmt = stmt.where(
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%")
        )
    stmt = stmt.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit)

    result = await db.execute(stmt)
    users = result.scalars().all()
    return [{
        "id": u.id,
        "name": f"{u.first_name} {u.last_name}",
        "email": u.email,
        "phone": u.phone,
        "role": u.role.value,
        "is_active": u.is_active,
        "is_verified": u.is_verified,
        "state": u.state,
        "rating": u.rating,
        "total_earned": u.total_earned,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    } for u in users]


@router.put("/users/{user_id}/ban")
async def ban_user(user_id: int, current_user: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.flush()
    return {"message": f"User {user.first_name} banned"}


@router.put("/users/{user_id}/unban")
async def unban_user(user_id: int, current_user: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    await db.flush()
    return {"message": f"User {user.first_name} unbanned"}


@router.put("/users/{user_id}/verify")
async def verify_user(user_id: int, current_user: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    user.verification_status = "verified"
    await db.flush()
    return {"message": f"User {user.first_name} verified"}


@router.get("/transactions")
async def list_all_transactions(
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Transaction).order_by(Transaction.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    txns = result.scalars().all()

    responses = []
    for t in txns:
        user = await db.get(User, t.user_id)
        responses.append({
            "id": t.id,
            "reference": t.reference,
            "user_name": f"{user.first_name} {user.last_name}" if user else "",
            "user_role": user.role.value if user else "",
            "type": t.type.value,
            "category": t.category.value,
            "amount": t.amount,
            "status": t.status.value,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return responses


@router.put("/agent-farmers/{farmer_id}/approve")
async def approve_agent_farmer(farmer_id: int, current_user: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    farmer = await db.get(AgentFarmer, farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    farmer.status = FarmerStatus.verified
    farmer.admin_approved = True
    await db.flush()
    return {"message": "Farmer approved"}


@router.put("/agent-farmers/{farmer_id}/reject")
async def reject_agent_farmer(farmer_id: int, current_user: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    farmer = await db.get(AgentFarmer, farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    farmer.status = FarmerStatus.rejected
    await db.flush()
    return {"message": "Farmer rejected"}
