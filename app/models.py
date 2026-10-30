from datetime import datetime , timezone 

from sqlalchemy import CheckConstraint, Column, DateTime, Float, Index, Integer, String, Text, text, Boolean,ForeignKey, Numeric
from .database import Base
from sqlalchemy.orm import  relationship
def utc_now():
    return datetime.now(timezone.utc)

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),onupdate=lambda: datetime.now(timezone.utc))

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    category = Column(String(100), nullable=False)
    image_url = Column(String(300), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

class Address(Base):
    __tablename__="Address"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    street = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pin_code = Column(String(6), nullable=False)
    phone_number = Column(String(15), nullable=False)
class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','confirmed','shipped','delivered','cancelled')",
            name="ck_orders_status",
        ),
        CheckConstraint("total_amount >= 0", name="ck_orders_total_positive"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    address_id = Column(Integer, ForeignKey("Address.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="pending")
    total_amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),
        Index("ux_order_items_order_product", "order_id", "product_id", unique=True),
    )
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    product_name = Column(String(200), nullable=False)
    product_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")


   
       
class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_payments_amount_positive"),
        CheckConstraint("method IN ('cod','upi','card')", name="ck_payments_method"),
        CheckConstraint(
            "status IN ('pending','paid','failed','refunded')",
            name="ck_payments_status",
        ),
        # MSSQL allows only one NULL in a normal unique column, so use a filtered index
        Index(
            "ux_payments_transaction_id",
            "transaction_id",
            unique=True,
            mssql_where=text("transaction_id IS NOT NULL"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    method = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="pending")

    transaction_id = Column(String(100), nullable=True)   # reference from the payment gateway
    card_last4 = Column(String(4), nullable=True)         # last 4 digits only, never the full number
    failure_reason = Column(String(200), nullable=True)

    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    order = relationship("Order", back_populates="payments")