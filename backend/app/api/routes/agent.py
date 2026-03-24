from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.models.agent_farmer import AgentFarmer, FarmerStatus
from app.core.security import get_current_user

router = APIRouter(prefix="/agent", tags=["Agent"])


class RegisterFarmer(BaseModel):
    first_name: str
    last_name: str
    phone: str
    farm_location: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nin: Optional[str] = None
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    account_number: Optional[str] = None
    nok_name: Optional[str] = None
    nok_phone: Optional[str] = None
    nok_relationship: Optional[str] = None


class FarmerResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    farm_location: Optional[str] = None
    state: Optional[str] = None
    nin_verified: bool = False
    bank_verified: bool = False
    bank_matches_nin: bool = False
    flagged_agent_account: bool = False
    account_name: Optional[str] = None
    status: str
    total_products: int = 0
    total_earned: float = 0.0
    rating: float = 0.0

    class Config:
        from_attributes = True


@router.post("/farmers", response_model=FarmerResponse, status_code=201)
async def register_farmer(
    data: RegisterFarmer,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "agent":
        raise HTTPException(status_code=403, detail="Only agents can register farmers")

    farmer = AgentFarmer(
        agent_id=current_user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        farm_location=data.farm_location,
        state=data.state,
        latitude=data.latitude,
        longitude=data.longitude,
        nin=data.nin,
        bank_name=data.bank_name,
        bank_code=data.bank_code,
        account_number=data.account_number,
        nok_name=data.nok_name,
        nok_phone=data.nok_phone,
        nok_relationship=data.nok_relationship,
        status=FarmerStatus.pending,
    )

    # Flag if bank account matches agent's own account
    if data.account_number and current_user.account_number:
        if data.account_number == current_user.account_number:
            farmer.flagged_agent_account = True

    # In production: call Paystack to verify account name
    # In production: call Smile ID / VerifyMe to verify NIN

    db.add(farmer)
    await db.flush()
    await db.refresh(farmer)
    return FarmerResponse.model_validate(farmer)


@router.get("/farmers", response_model=List[FarmerResponse])
async def list_my_farmers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "agent":
        raise HTTPException(status_code=403, detail="Only agents can view farmers")

    stmt = select(AgentFarmer).where(AgentFarmer.agent_id == current_user.id).order_by(AgentFarmer.created_at.desc())
    result = await db.execute(stmt)
    return [FarmerResponse.model_validate(f) for f in result.scalars().all()]


@router.get("/farmers/{farmer_id}", response_model=FarmerResponse)
async def get_farmer(
    farmer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    farmer = await db.get(AgentFarmer, farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    if farmer.agent_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return FarmerResponse.model_validate(farmer)


@router.get("/dashboard")
async def agent_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "agent":
        raise HTTPException(status_code=403, detail="Only agents")

    stmt = select(AgentFarmer).where(AgentFarmer.agent_id == current_user.id)
    result = await db.execute(stmt)
    farmers = result.scalars().all()

    return {
        "total_farmers": len(farmers),
        "verified_farmers": sum(1 for f in farmers if f.status == FarmerStatus.verified),
        "pending_farmers": sum(1 for f in farmers if f.status == FarmerStatus.pending),
        "total_commission": current_user.total_earned,
        "wallet_balance": current_user.wallet_balance,
        "commission_rate": current_user.agent_commission_rate,
    }
