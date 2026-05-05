from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models import CalculatorHistory

router = APIRouter(prefix="/api/v1/calculator", tags=["calculator"])

class CalcHistoryCreate(BaseModel):
    expression: str
    result: str

class CalcHistoryResponse(BaseModel):
    id: int
    expression: str
    result: str
    created_at: datetime
    
    class Config:
        from_attributes = True

def clean_old_history(db: Session):
    one_day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    db.query(CalculatorHistory).filter(CalculatorHistory.created_at < one_day_ago).delete()
    db.commit()

@router.post("/history", response_model=CalcHistoryResponse)
def save_history(item: CalcHistoryCreate, db: Session = Depends(get_db)):
    db_item = CalculatorHistory(expression=item.expression, result=item.result)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/history", response_model=List[CalcHistoryResponse])
def get_history(db: Session = Depends(get_db)):
    clean_old_history(db)
    return db.query(CalculatorHistory).order_by(desc(CalculatorHistory.created_at)).limit(50).all()

@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    db.query(CalculatorHistory).delete()
    db.commit()
    return {"ok": True}
