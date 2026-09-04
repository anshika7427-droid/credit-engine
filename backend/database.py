import datetime

from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from backend.config import DB_PATH
except ImportError:
    from src.config import DB_PATH

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String, unique=True, index=True)
    borrower_type = Column(String)
    credit_score = Column(Integer)
    risk_tier = Column(String)
    status = Column(String)
    default_probability = Column(Float)
    raw_payload = Column(JSON)
    shap_explanations = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
