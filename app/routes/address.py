from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Address, Users

router = APIRouter(prefix="/address", tags=["address"])


class AddressCreate(BaseModel):
    user_id: int
    street: str = Field(min_length=1, max_length=200)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pin_code: str = Field(min_length=6, max_length=6)
    phone_number: str = Field(min_length=10, max_length=15)

@router.post("/create", response_model=AddressCreate, status_code=201)
def create_address(address: AddressCreate, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == address.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_address = Address(
        user_id=address.user_id,
        street=address.street,
        city=address.city,
        state=address.state,
        pin_code=address.pin_code,
        phone_number=address.phone_number,
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address