from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class FarmerStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    suspended = "suspended"


class AgentFarmer(Base):
    """Farmers registered by agents (illiterate farmers who can't use the app)"""
    __tablename__ = "agent_farmers"

    id = Column(Integer, primary_key=True, index=True)

    # Agent who registered this farmer
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent = relationship("User", back_populates="managed_farmers", foreign_keys=[agent_id])

    # Farmer identity
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    photo_url = Column(String(500))
    farm_location = Column(String(300))
    state = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)

    # NIN Verification
    nin = Column(String(20))
    nin_name = Column(String(200))  # Name returned from NIN API
    nin_photo_url = Column(String(500))  # Photo from NIN API
    nin_verified = Column(Boolean, default=False)
    nin_match_score = Column(Float)  # Facial match percentage
    nin_address = Column(Text)  # Address from NIN

    # Bank details (for payment)
    bank_name = Column(String(100))
    bank_code = Column(String(10))
    account_number = Column(String(20))
    account_name = Column(String(200))  # Auto-fetched from Paystack
    bank_verified = Column(Boolean, default=False)
    bank_matches_nin = Column(Boolean, default=False)  # Account name matches NIN name

    # Agent's own bank flagging
    flagged_agent_account = Column(Boolean, default=False)  # True if matches agent's account

    # Next of kin
    nok_name = Column(String(200))
    nok_phone = Column(String(20))
    nok_relationship = Column(String(50))

    # Status
    status = Column(SAEnum(FarmerStatus), default=FarmerStatus.pending)
    admin_approved = Column(Boolean, default=False)
    admin_notes = Column(Text)

    # Stats
    total_products = Column(Integer, default=0)
    total_sold = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
