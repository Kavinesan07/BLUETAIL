from fastapi import APIRouter, FastAPI

from .routes import users , products


api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(products.router)
