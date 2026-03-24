from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func

from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # order, payment, delivery, alert, review
    is_read = Column(Boolean, default=False)
    link = Column(String(300))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    target_price = Column(Integer, nullable=False)
    unit = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    triggered = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SavedAddress(Base):
    __tablename__ = "saved_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String(50), nullable=False)  # Home, Office, etc.
    address = Column(Text, nullable=False)
    city = Column(String(100))
    state = Column(String(100))
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HarvestSchedule(Base):
    __tablename__ = "harvest_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop = Column(String(100), nullable=False)
    variety = Column(String(100))
    planted_date = Column(DateTime(timezone=True), nullable=False)
    expected_harvest = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text)
    water_schedule = Column(String(100))
    status = Column(String(20), default="growing")  # planted, growing, ready, harvested
    created_at = Column(DateTime(timezone=True), server_default=func.now())
