from fastapi import APIRouter, FastAPI



from .routes import users , products, address , orders ,payments


api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(address.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)