from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    phone: str
    password: str
    first_name: str
    last_name: str
    role: str  # farmer, agent, buyer, logistics
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    nin: Optional[str] = None
    id_type: Optional[str] = None
    farm_name: Optional[str] = None
    vehicle_type: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    phone: str
    first_name: str
    last_name: str
    role: str
    avatar_url: Optional[str] = None
    is_verified: bool
    state: Optional[str] = None
    city: Optional[str] = None
    rating: float = 0.0
    wallet_balance: float = 0.0
    escrow_balance: float = 0.0
    total_earned: float = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    farm_name: Optional[str] = None
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BankVerifyRequest(BaseModel):
    account_number: str
    bank_code: str


class BankVerifyResponse(BaseModel):
    account_name: str
    account_number: str
    bank_name: str
