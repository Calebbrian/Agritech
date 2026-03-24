from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
import traceback

from app.db.session import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.transaction import Transaction, TransactionType, TransactionCategory, TransactionStatus
from app.schemas.order import OrderCreate, OrderResponse, AssignLogistics, OrderStatusUpdate, ProofOfDelivery
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/orders", tags=["Orders"])


def gen_order_number():
    return f"FL-{uuid.uuid4().hex[:8].upper()}"


def gen_ref():
    return f"TXN-{uuid.uuid4().hex[:12].upper()}"


def order_to_response(o, buyer_name=None, seller_name=None, logistics_name=None):
    status_val = o.status.value if hasattr(o.status, 'value') else str(o.status)
    pay_val = o.payment_status.value if hasattr(o.payment_status, 'value') else str(o.payment_status)
    return OrderResponse(
        id=o.id,
        order_number=o.order_number,
        buyer_id=o.buyer_id,
        seller_id=o.seller_id,
        agent_id=o.agent_id,
        logistics_id=o.logistics_id,
        subtotal=o.subtotal,
        delivery_fee=o.delivery_fee or 0,
        platform_fee=o.platform_fee or 0,
        agent_commission=o.agent_commission or 0,
        total_amount=o.total_amount,
        status=status_val,
        payment_status=pay_val,
        delivery_address=o.delivery_address,
        delivery_city=o.delivery_city,
        estimated_delivery=o.estimated_delivery,
        pod_image_url=o.pod_image_url,
        created_at=o.created_at,
        buyer_name=buyer_name,
        seller_name=seller_name,
        logistics_name=logistics_name,
    )


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await _create_order(data, current_user, db)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def _create_order(data, current_user, db):
    role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can create orders")

    # Fetch products and calculate totals
    items = []
    subtotal = 0.0
    seller_id = None

    for cart_item in data.items:
        product = await db.get(Product, cart_item.product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        if product.quantity_available < cart_item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

        item_total = product.price * cart_item.quantity
        subtotal += item_total

        if seller_id is None:
            seller_id = product.owner_id
        elif seller_id != product.owner_id:
            raise HTTPException(status_code=400, detail="All items must be from the same seller")

        items.append(OrderItem(
            product_id=product.id,
            quantity=cart_item.quantity,
            unit_price=product.price,
            total_price=item_total,
        ))

        # Reduce stock
        product.quantity_available -= cart_item.quantity

    platform_fee = subtotal * (settings.PLATFORM_FEE_PERCENT / 100)
    agent_commission = 0.0
    delivery_fee = 3500.0 if subtotal < 50000 else 0.0  # Free delivery over NGN 50,000

    # Check if product was listed by agent
    first_product = await db.get(Product, data.items[0].product_id)
    if first_product and first_product.listed_by_agent_id:
        agent_commission = subtotal * (settings.AGENT_COMMISSION_PERCENT / 100)

    total = subtotal + platform_fee + delivery_fee

    order = Order(
        order_number=gen_order_number(),
        buyer_id=current_user.id,
        seller_id=seller_id,
        agent_id=first_product.listed_by_agent_id if first_product else None,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        platform_fee=platform_fee,
        agent_commission=agent_commission,
        total_amount=total,
        status=OrderStatus.pending,
        payment_status=PaymentStatus.pending,
        delivery_address=data.delivery_address,
        delivery_city=data.delivery_city,
        delivery_state=data.delivery_state,
    )
    db.add(order)
    await db.flush()

    for item in items:
        item.order_id = order.id
        db.add(item)

    # Create escrow transaction
    txn = Transaction(
        reference=gen_ref(),
        user_id=current_user.id,
        order_id=order.id,
        type=TransactionType.debit,
        category=TransactionCategory.order_payment,
        amount=total,
        description=f"Payment for order {order.order_number}",
        status=TransactionStatus.escrow,
        payment_method=data.payment_method,
    )
    db.add(txn)
    await db.flush()
    await db.refresh(order)

    return order_to_response(order)


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    role = current_user.role.value

    if role == "buyer":
        stmt = select(Order).where(Order.buyer_id == current_user.id)
    elif role == "farmer":
        stmt = select(Order).where(Order.seller_id == current_user.id)
    elif role == "agent":
        stmt = select(Order).where(Order.agent_id == current_user.id)
    elif role == "logistics":
        stmt = select(Order).where(Order.logistics_id == current_user.id)
    elif role == "admin":
        stmt = select(Order)
    else:
        raise HTTPException(status_code=403, detail="Access denied")

    if status:
        stmt = stmt.where(Order.status == status)

    stmt = stmt.order_by(Order.created_at.desc())
    result = await db.execute(stmt)
    orders = result.scalars().all()

    responses = []
    for o in orders:
        buyer = await db.get(User, o.buyer_id)
        seller = await db.get(User, o.seller_id)
        b_name = f"{buyer.first_name} {buyer.last_name}" if buyer else None
        s_name = f"{seller.first_name} {seller.last_name}" if seller else None
        l_name = None
        if o.logistics_id:
            logi = await db.get(User, o.logistics_id)
            if logi:
                l_name = f"{logi.first_name} {logi.last_name}"
        responses.append(order_to_response(o, buyer_name=b_name, seller_name=s_name, logistics_name=l_name))
    return responses


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_response(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = OrderStatus(data.status)

    # Handle completion — release escrow
    if data.status == "delivered":
        order.payment_status = PaymentStatus.released

        # Pay seller
        seller = await db.get(User, order.seller_id)
        seller_amount = order.subtotal - order.agent_commission - order.platform_fee
        seller.wallet_balance += seller_amount
        seller.total_earned += seller_amount
        db.add(Transaction(
            reference=gen_ref(), user_id=seller.id, order_id=order.id,
            type=TransactionType.credit, category=TransactionCategory.order_received,
            amount=seller_amount, balance_after=seller.wallet_balance,
            description=f"Payment for order {order.order_number}",
            status=TransactionStatus.completed,
        ))

        # Pay agent commission if applicable
        if order.agent_id and order.agent_commission > 0:
            agent = await db.get(User, order.agent_id)
            agent.wallet_balance += order.agent_commission
            agent.total_earned += order.agent_commission
            db.add(Transaction(
                reference=gen_ref(), user_id=agent.id, order_id=order.id,
                type=TransactionType.credit, category=TransactionCategory.agent_commission,
                amount=order.agent_commission, balance_after=agent.wallet_balance,
                description=f"Commission for order {order.order_number}",
                status=TransactionStatus.completed,
            ))

        # Pay logistics
        if order.logistics_id and order.delivery_fee > 0:
            logistics = await db.get(User, order.logistics_id)
            logistics.wallet_balance += order.delivery_fee
            logistics.total_earned += order.delivery_fee
            db.add(Transaction(
                reference=gen_ref(), user_id=logistics.id, order_id=order.id,
                type=TransactionType.credit, category=TransactionCategory.delivery_fee,
                amount=order.delivery_fee, balance_after=logistics.wallet_balance,
                description=f"Delivery fee for order {order.order_number}",
                status=TransactionStatus.completed,
            ))

    await db.flush()
    await db.refresh(order)
    return order_to_response(order)


@router.put("/{order_id}/assign-logistics")
async def assign_logistics(
    order_id: int,
    data: AssignLogistics,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    logistics = await db.get(User, data.logistics_id)
    if not logistics or logistics.role.value != "logistics":
        raise HTTPException(status_code=400, detail="Invalid logistics partner")

    order.logistics_id = data.logistics_id
    order.status = OrderStatus.assigned_logistics
    await db.flush()
    return {"message": "Logistics assigned", "logistics_name": f"{logistics.first_name} {logistics.last_name}"}


@router.put("/{order_id}/proof-of-delivery")
async def submit_pod(
    order_id: int,
    data: ProofOfDelivery,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.logistics_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to this delivery")

    order.pod_image_url = data.image_url
    order.pod_note = data.note
    order.status = OrderStatus.delivered
    await db.flush()
    return {"message": "Proof of delivery submitted"}
