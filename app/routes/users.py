import bcrypt
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Users

router = APIRouter(prefix="/users", tags=["users"])


# ---------- Schemas ----------

class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- Helper ----------

def user_to_dict(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


# ---------- POST: create ----------

@router.post("/create", status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(Users).filter(Users.email == data.email).first():
        raise HTTPException(status_code=409, detail="User already exists")

    user = Users(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not create user")

    return {"message": "User created successfully!", "user": user_to_dict(user)}


# ---------- POST: login ----------

@router.post("/login")
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.email == data.email).first()

    if not user or not bcrypt.checkpw(data.password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"message": "Sign-in successful!", "user": user_to_dict(user)}


# ---------- GET: all users ----------

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return [user_to_dict(u) for u in db.query(Users).all()]


# ---------- GET: one user ----------

@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_dict(user)


# ---------- PUT: update ----------

@router.put("/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    changes = data.model_dump(exclude_unset=True)

    if "email" in changes and changes["email"] != user.email:
        taken = db.query(Users).filter(Users.email == changes["email"]).first()
        if taken:
            raise HTTPException(status_code=409, detail="Email already in use")
        user.email = changes["email"]

    if "username" in changes:
        user.username = changes["username"]

    if "password" in changes:
        user.hashed_password = hash_password(changes["password"])

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update user")

    return {"message": "User updated successfully!", "user": user_to_dict(user)}


# ---------- DELETE ----------

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(user)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete user")

    return {"message": "User deleted successfully!"}    