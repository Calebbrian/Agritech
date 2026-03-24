from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class ProductCategory(str, enum.Enum):
    fruits = "fruits"
    vegetables = "vegetables"
    grains = "grains"
    tubers = "tubers"
    livestock = "livestock"
    dairy = "dairy"
    spices = "spices"
    oils = "oils"
    other = "other"


class ProductUnit(str, enum.Enum):
    kg = "kg"
    basket = "basket"
    bag = "bag"
    tuber = "tuber"
    bunch = "bunch"
    piece = "piece"
    litre = "litre"
    crate = "crate"
    mudu = "mudu"
    paint = "paint"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    category = Column(SAEnum(ProductCategory), nullable=False, index=True)
    price = Column(Float, nullable=False)
    unit = Column(SAEnum(ProductUnit), nullable=False)
    quantity_available = Column(Integer, default=0)
    min_order = Column(Integer, default=1)
    is_organic = Column(Boolean, default=False)
    quality_grade = Column(String(20), default="Grade A")

    # Images
    image_url = Column(String(500))
    image_urls = Column(Text)  # JSON array of image URLs

    # Owner
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="products", foreign_keys=[owner_id])

    # Agent listing
    listed_by_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    listed_by_agent = relationship("User", foreign_keys=[listed_by_agent_id])
    farmer_id = Column(Integer, ForeignKey("agent_farmers.id"), nullable=True)

    # Location (from farm)
    farm_location = Column(String(200))
    state = Column(String(100), index=True)
    latitude = Column(Float)
    longitude = Column(Float)

    # Stats
    views = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    total_sold = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)

    # Group deal
    is_group_deal = Column(Boolean, default=False)
    group_price = Column(Float, nullable=True)
    group_min_buyers = Column(Integer, nullable=True)
    group_current_buyers = Column(Integer, default=0)
    group_deadline = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    order_items = relationship("OrderItem", back_populates="product")
