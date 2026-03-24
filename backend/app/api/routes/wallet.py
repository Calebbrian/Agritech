from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionCategory, TransactionStatus
from app.core.security import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    return {
        "available": current_user.wallet_balance,
        "escrow": current_user.escrow_balance,
        "total_earned": current_user.total_earned,
    }


@router.get("/transactions")
async def list_transactions(
    type: str = None,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    if type:
        stmt = stmt.where(Transaction.type == type)
    stmt = stmt.order_by(Transaction.created_at.desc()).offset((page - 1) * limit).limit(limit)

    result = await db.execute(stmt)
    txns = result.scalars().all()
    return [{
        "id": t.id,
        "reference": t.reference,
        "type": t.type.value,
        "category": t.category.value,
        "amount": t.amount,
        "balance_after": t.balance_after,
        "description": t.description,
        "status": t.status.value,
        "payment_method": t.payment_method,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    } for t in txns]


@router.post("/withdraw")
async def withdraw(
    amount: float,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if amount > current_user.wallet_balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    if not current_user.bank_verified:
        raise HTTPException(status_code=400, detail="Bank account not verified")

    current_user.wallet_balance -= amount

    txn = Transaction(
        reference=f"WD-{uuid.uuid4().hex[:12].upper()}",
        user_id=current_user.id,
        type=TransactionType.debit,
        category=TransactionCategory.withdrawal,
        amount=amount,
        balance_after=current_user.wallet_balance,
        description=f"Withdrawal of ₦{amount:,.0f} to {current_user.bank_name} - {current_user.account_number}",
        status=TransactionStatus.pending,
        payment_method="bank_transfer",
    )
    db.add(txn)
    await db.flush()

    # In production: trigger Paystack Transfer API here
    return {"message": "Withdrawal initiated", "reference": txn.reference, "new_balance": current_user.wallet_balance}
