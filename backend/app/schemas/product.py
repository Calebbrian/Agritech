from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    unit: str
    quantity_available: int = 0
    min_order: int = 1
    is_organic: bool = False
    quality_grade: str = "Grade A"
    farm_location: Optional[str] = None
    state: Optional[str] = None
    image_url: Optional[str] = None
    image_urls: Optional[str] = None  # JSON array string
    # Agent fields
    farmer_id: Optional[int] = None
    # Group deal
    is_group_deal: bool = False
    group_price: Optional[float] = None
    group_min_buyers: Optional[int] = None
    group_deadline: Optional[datetime] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity_available: Optional[int] = None
    is_active: Optional[bool] = None
    quality_grade: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str
    price: float
    unit: str
    quantity_available: int
    min_order: int
    is_organic: bool
    quality_grade: str
    image_url: Optional[str] = None
    image_urls: Optional[str] = None
    owner_id: int
    listed_by_agent_id: Optional[int] = None
    farm_location: Optional[str] = None
    state: Optional[str] = None
    views: int = 0
    rating: float = 0.0
    total_sold: int = 0
    is_active: bool
    is_group_deal: bool = False
    group_price: Optional[float] = None
    group_min_buyers: Optional[int] = None
    group_current_buyers: int = 0
    group_deadline: Optional[datetime] = None
    created_at: Optional[datetime] = None

    # Joined data
    owner_name: Optional[str] = None
    owner_rating: Optional[float] = None
    owner_verified: Optional[bool] = None

    class Config:
        from_attributes = True


class ProductSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    is_organic: Optional[bool] = None
    sort_by: Optional[str] = "created_at"  # price, rating, distance
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None
