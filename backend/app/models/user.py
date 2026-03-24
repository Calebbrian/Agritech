from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class UserRole(str, enum.Enum):
    farmer = "farmer"
    agent = "agent"
    buyer = "buyer"
    logistics = "logistics"
    admin = "admin"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    avatar_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(SAEnum(VerificationStatus), default=VerificationStatus.pending)

    # Identity verification
    nin = Column(String(20))
    bvn = Column(String(20))
    id_type = Column(String(50))  # nin, bvn, voters_card
    id_image_url = Column(String(500))
    nin_photo_url = Column(String(500))  # Photo from NIN verification API
    nin_verified = Column(Boolean, default=False)

    # Location
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)

    # Farmer-specific
    farm_name = Column(String(200))
    farm_size = Column(String(100))
    farming_type = Column(String(100))  # organic, conventional

    # Agent-specific
    agent_commission_rate = Column(Float, default=10.0)

    # Logistics-specific
    vehicle_type = Column(String(50))  # bike, van, truck
    vehicle_plate = Column(String(20))
    is_available = Column(Boolean, default=True)

    # Bank details
    bank_name = Column(String(100))
    account_number = Column(String(20))
    account_name = Column(String(200))  # Auto-fetched from Paystack
    bank_code = Column(String(10))
    bank_verified = Column(Boolean, default=False)

    # Next of kin
    nok_name = Column(String(200))
    nok_phone = Column(String(20))
    nok_relationship = Column(String(50))

    # Wallet
    wallet_balance = Column(Float, default=0.0)
    escrow_balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)

    # Ratings
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)

    # Sustainability
    sustainability_score = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    products = relationship("Product", back_populates="owner", foreign_keys="Product.owner_id")
    orders_as_buyer = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id")
    orders_as_seller = relationship("Order", back_populates="seller", foreign_keys="Order.seller_id")
    managed_farmers = relationship("AgentFarmer", back_populates="agent", foreign_keys="AgentFarmer.agent_id")
