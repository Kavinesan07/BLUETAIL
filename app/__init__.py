from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .urls import api_router

app = FastAPI(title="Task Manager")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)