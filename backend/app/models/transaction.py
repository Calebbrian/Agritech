from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class TransactionType(str, enum.Enum):
    credit = "credit"
    debit = "debit"


class TransactionCategory(str, enum.Enum):
    order_payment = "order_payment"
    order_received = "order_received"
    delivery_fee = "delivery_fee"
    agent_commission = "agent_commission"
    platform_fee = "platform_fee"
    withdrawal = "withdrawal"
    refund = "refund"
    escrow_hold = "escrow_hold"
    escrow_release = "escrow_release"


class TransactionStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    escrow = "escrow"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(100), unique=True, nullable=False, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)

    type = Column(SAEnum(TransactionType), nullable=False)
    category = Column(SAEnum(TransactionCategory), nullable=False)
    amount = Column(Float, nullable=False)
    balance_after = Column(Float)
    description = Column(Text)
    status = Column(SAEnum(TransactionStatus), default=TransactionStatus.pending)

    # Payment details
    payment_method = Column(String(50))  # card, bank_transfer, ussd, wallet
    paystack_reference = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
