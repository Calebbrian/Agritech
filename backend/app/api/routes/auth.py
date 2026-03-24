from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import traceback

from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    try:
        # Check existing
        result = await db.execute(select(User).where(or_(User.email == data.email, User.phone == data.phone)))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email or phone already registered")

        user = User(
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            role=UserRole(data.role),
            state=data.state,
            city=data.city,
            address=data.address,
            nin=data.nin,
            id_type=data.id_type,
            farm_name=data.farm_name,
            vehicle_type=data.vehicle_type,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

        role_val = user.role.value if hasattr(user.role, 'value') else str(user.role)
        token = create_access_token({"sub": str(user.id), "role": role_val})
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                phone=user.phone,
                first_name=user.first_name,
                last_name=user.last_name,
                role=role_val,
                avatar_url=user.avatar_url,
                is_verified=user.is_verified or False,
                state=user.state,
                city=user.city,
                rating=user.rating or 0.0,
                wallet_balance=user.wallet_balance or 0.0,
                escrow_balance=user.escrow_balance or 0.0,
                total_earned=user.total_earned or 0.0,
                created_at=user.created_at,
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(
            or_(User.email == data.email, User.phone == data.email)
        ))
        user = result.scalar_one_or_none()
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Account is deactivated")

        role_val = user.role.value if hasattr(user.role, 'value') else str(user.role)
        token = create_access_token({"sub": str(user.id), "role": role_val})
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                phone=user.phone,
                first_name=user.first_name,
                last_name=user.last_name,
                role=role_val,
                avatar_url=user.avatar_url,
                is_verified=user.is_verified or False,
                state=user.state,
                city=user.city,
                rating=user.rating or 0.0,
                wallet_balance=user.wallet_balance or 0.0,
                escrow_balance=user.escrow_balance or 0.0,
                total_earned=user.total_earned or 0.0,
                created_at=user.created_at,
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        phone=current_user.phone,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=role_val,
        avatar_url=current_user.avatar_url,
        is_verified=current_user.is_verified or False,
        state=current_user.state,
        city=current_user.city,
        rating=current_user.rating or 0.0,
        wallet_balance=current_user.wallet_balance or 0.0,
        escrow_balance=current_user.escrow_balance or 0.0,
        total_earned=current_user.total_earned or 0.0,
        created_at=current_user.created_at,
    )
