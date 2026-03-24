from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CartItem(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[CartItem]
    delivery_address: str
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    payment_method: str = "card"  # card, bank_transfer, ussd


class OrderResponse(BaseModel):
    id: int
    order_number: str
    buyer_id: int
    seller_id: int
    agent_id: Optional[int] = None
    logistics_id: Optional[int] = None
    subtotal: float
    delivery_fee: float
    platform_fee: float
    agent_commission: float
    total_amount: float
    status: str
    payment_status: str
    delivery_address: str
    delivery_city: Optional[str] = None
    estimated_delivery: Optional[str] = None
    pod_image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    # Joined
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    logistics_name: Optional[str] = None
    items: Optional[list] = None

    class Config:
        from_attributes = True


class AssignLogistics(BaseModel):
    logistics_id: int


class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class ProofOfDelivery(BaseModel):
    image_url: str
    note: Optional[str] = None
