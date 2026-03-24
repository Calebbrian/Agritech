from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional, List

from app.db.session import get_db
from app.models.user import User
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductResponse])
async def list_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_organic: Optional[bool] = None,
    sort_by: str = "created_at",
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Product).where(Product.is_active == True)

    if query:
        stmt = stmt.where(or_(
            Product.name.ilike(f"%{query}%"),
            Product.description.ilike(f"%{query}%"),
        ))
    if category:
        stmt = stmt.where(Product.category == category)
    if state:
        stmt = stmt.where(Product.state == state)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if is_organic is not None:
        stmt = stmt.where(Product.is_organic == is_organic)

    if sort_by == "price_low":
        stmt = stmt.order_by(Product.price.asc())
    elif sort_by == "price_high":
        stmt = stmt.order_by(Product.price.desc())
    elif sort_by == "rating":
        stmt = stmt.order_by(Product.rating.desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    stmt = stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    products = result.scalars().all()

    responses = []
    for p in products:
        owner = await db.get(User, p.owner_id)
        resp = ProductResponse.model_validate(p)
        if owner:
            resp.owner_name = f"{owner.first_name} {owner.last_name}"
            resp.owner_rating = owner.rating
            resp.owner_verified = owner.is_verified
        responses.append(resp)
    return responses


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Increment views
    product.views += 1
    await db.flush()

    owner = await db.get(User, product.owner_id)
    resp = ProductResponse.model_validate(product)
    if owner:
        resp.owner_name = f"{owner.first_name} {owner.last_name}"
        resp.owner_rating = owner.rating
        resp.owner_verified = owner.is_verified
    return resp


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value not in ("farmer", "agent", "admin"):
        raise HTTPException(status_code=403, detail="Only farmers and agents can list products")

    product = Product(
        name=data.name,
        description=data.description,
        category=data.category,
        price=data.price,
        unit=data.unit,
        quantity_available=data.quantity_available,
        min_order=data.min_order,
        is_organic=data.is_organic,
        quality_grade=data.quality_grade,
        farm_location=data.farm_location or current_user.address,
        state=data.state or current_user.state,
        latitude=current_user.latitude,
        longitude=current_user.longitude,
        owner_id=current_user.id,
        image_url=data.image_url,
        image_urls=data.image_urls,
        is_group_deal=data.is_group_deal,
        group_price=data.group_price,
        group_min_buyers=data.group_min_buyers,
        group_deadline=data.group_deadline,
    )

    if current_user.role.value == "agent" and data.farmer_id:
        product.listed_by_agent_id = current_user.id
        product.farmer_id = data.farmer_id

    db.add(product)
    await db.flush()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    await db.flush()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    product.is_active = False
    await db.flush()
    return {"message": "Product deleted"}


@router.get("/my/listings", response_model=List[ProductResponse])
async def my_products(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Product).where(Product.owner_id == current_user.id).order_by(Product.created_at.desc())
    result = await db.execute(stmt)
    return [ProductResponse.model_validate(p) for p in result.scalars().all()]
