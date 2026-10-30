from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, Payment

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentCreate(BaseModel):
    order_id: int
    method: Literal["cod", "upi", "card"]


@router.post("", status_code=201)
def create_payment(data: PaymentCreate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="This order is already paid or closed")

    is_cod = data.method == "cod"
    payment = Payment(
        order_id=order.id,
        user_id=order.user_id,
        amount=order.total_amount,                 # taken from the order, not from the browser
        method=data.method,
        status="pending" if is_cod else "paid",    # demo: online methods count as paid
        paid_at=None if is_cod else datetime.now(timezone.utc),
    )
    order.status = "confirmed"
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "id": payment.id,
        "order_id": payment.order_id,
        "amount": float(payment.amount),
        "method": payment.method,
        "status": payment.status,
    }