from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session , relationship

from ..database import get_db
from ..models import Address, Order, OrderItem, Product

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderLine(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100)


class OrderCreate(BaseModel):
    user_id: int
    address_id: int
    items: list[OrderLine] = Field(min_length=1)


def order_to_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "user_id": order.user_id,
        "address_id": order.address_id,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": [
            {
                "product_id": i.product_id,
                "product_name": i.product_name,
                "unit_price": float(i.unit_price),
                "quantity": i.quantity,
            }
            for i in order.items
        ],
    }


@router.post("/create", status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    # 1. the address must exist and belong to this user
    address = (
        db.query(Address)
        .filter(Address.id == data.address_id, Address.user_id == data.user_id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # 2. merge repeated products (the same product twice becomes one line)
    wanted: dict[int, int] = {}
    for line in data.items:
        wanted[line.product_id] = wanted.get(line.product_id, 0) + line.quantity

    products = (
        db.query(Product)
        .filter(Product.id.in_(list(wanted)), Product.is_deleted.is_(False))
        .all()
    )
    by_id = {p.id: p for p in products}

    order = Order(
        user_id=data.user_id,
        address_id=data.address_id,
        status="pending",
        total_amount=Decimal("0"),
    )
    total = Decimal("0")

    try:
        for product_id, qty in wanted.items():
            product = by_id.get(product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

            # 3. take the stock in one safe step. It only works if enough stock is left.
            changed = (
                db.query(Product)
                .filter(Product.id == product_id, Product.is_deleted.is_(False), Product.stock >= qty)
                .update({Product.stock: Product.stock - qty}, synchronize_session=False)
            )
            if changed == 0:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

            # 4. the price comes from the database, never from the browser
            unit_price = Decimal(str(product.price)).quantize(Decimal("0.01"))
            total += unit_price * qty
            order.items.append(
                OrderItem(
                    product_id=product_id,
                    product_name=product.name,
                    unit_price=unit_price,
                    quantity=qty,
                )
            )

        order.total_amount = total
        db.add(order)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not create the order")

    db.refresh(order)
    return order_to_dict(order)


@router.get("")
def list_orders(user_id: int, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.id.desc())
        .all()
    )
    return [order_to_dict(o) for o in orders]


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_dict(order)