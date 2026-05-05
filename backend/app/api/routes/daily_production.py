from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/api/v1/daily_production", tags=["daily_production"])

@router.post("", response_model=schemas.DailyProductionResponse)
def create_daily_production(schema: schemas.DailyProductionCreate, db: Session = Depends(get_db)):
    return crud.create_daily_production(db, schema)

@router.get("", response_model=List[schemas.DailyProductionResponse])
def read_daily_productions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_daily_productions(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas.DailyProductionResponse)
def read_daily_production(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_daily_production(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/{id}", response_model=schemas.DailyProductionResponse)
def update_daily_production(id: int, schema: schemas.DailyProductionUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_daily_production(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/{id}")
def delete_daily_production(id: int, db: Session = Depends(get_db)):
    if not crud.delete_daily_production(db, id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
