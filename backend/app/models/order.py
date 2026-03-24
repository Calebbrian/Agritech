from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    assigned_logistics = "assigned_logistics"
    picked_up = "picked_up"
    in_transit = "in_transit"
    delivered = "delivered"
    completed = "completed"
    cancelled = "cancelled"
    disputed = "disputed"
    refunded = "refunded"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    in_escrow = "in_escrow"
    released = "released"
    refunded = "refunded"
    failed = "failed"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)

    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer = relationship("User", back_populates="orders_as_buyer", foreign_keys=[buyer_id])

    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller = relationship("User", back_populates="orders_as_seller", foreign_keys=[seller_id])

    # Agent who facilitated (if any)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent = relationship("User", foreign_keys=[agent_id])

    # Logistics
    logistics_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    logistics = relationship("User", foreign_keys=[logistics_id])

    # Order details
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    agent_commission = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)

    # Status
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending, index=True)
    payment_status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending)

    # Payment
    payment_reference = Column(String(100))
    paystack_reference = Column(String(100))

    # Delivery
    delivery_address = Column(Text, nullable=False)
    delivery_city = Column(String(100))
    delivery_state = Column(String(100))
    delivery_latitude = Column(Float)
    delivery_longitude = Column(Float)
    pickup_address = Column(Text)
    pickup_latitude = Column(Float)
    pickup_longitude = Column(Float)
    estimated_delivery = Column(String(50))
    delivery_distance_km = Column(Float)

    # Tracking
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    tracking_updates = Column(Text)  # JSON array

    # Proof of delivery
    pod_image_url = Column(String(500))
    pod_note = Column(Text)
    delivered_at = Column(DateTime(timezone=True))

    # Quality check
    quality_issue = Column(Boolean, default=False)
    quality_note = Column(Text)

    # Buyer confirmation
    buyer_confirmed = Column(Boolean, default=False)
    buyer_confirmed_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
