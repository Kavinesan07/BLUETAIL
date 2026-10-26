from fastapi import APIRouter, FastAPI

from .routes import users 


api_router = APIRouter()
api_router.include_router(users.router)