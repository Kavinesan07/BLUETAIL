from sqlalchemy import text

from app import app  
from app import models 
from app.database import Base, engine 
import uvicorn


try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    print("Database connection check: SUCCESS ✅")
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database connection check: FAILED ❌")
    print(f"Error: {e}")





if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)