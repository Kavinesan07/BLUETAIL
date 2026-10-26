from sqlalchemy import URL, create_engine
from sqlalchemy.orm import sessionmaker , declarative_base

DB_SERVER = "KAVI"
DB_NAME = "bluetail"
DB_DRIVER = "ODBC Driver 18 for SQL Server"

database_url = URL.create(
    "mssql+pyodbc",
    host=DB_SERVER,
    database=DB_NAME,
    query={
        "driver": DB_DRIVER,
        "Trusted_Connection": "yes",
        "TrustServerCertificate": "yes",
    },
).render_as_string(hide_password=False)

engine = create_engine(database_url)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()