import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from contextlib import contextmanager

DB_USER = "root"
DB_PASSWORD = "Admin@123"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "discountdaddy"

# Safely URL-encode the password to shield against '@' parsing bugs
safe_password = urllib.parse.quote_plus(DB_PASSWORD)
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{safe_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
db_session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# scoped_session guarantees thread safety across modern incoming requests
db_session = scoped_session(db_session_factory)

Base = declarative_base()
Base.query = db_session.query_property()

@contextmanager
def get_db():
    """Context manager to safely yield and clean up database sessions."""
    db = db_session()
    try:
        yield db
    finally:
        db_session.remove()