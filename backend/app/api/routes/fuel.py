from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import schemas, crud
from app.models import FuelStock, FuelUsage

router = APIRouter(prefix="/api/v1/fuel", tags=["fuel"])

@router.get("/summary")
def get_fuel_summary(db: Session = Depends(get_db)):
    current_stock = db.query(func.sum(FuelStock.liters_remaining)).scalar() or 0
    total_spent = db.query(func.sum(FuelStock.total_cost)).scalar() or 0
    total_consumed = db.query(func.sum(FuelUsage.liters_used)).scalar() or 0
    
    usage_by_machine = []
    res = db.query(FuelUsage.machine_name, func.sum(FuelUsage.liters_used).label('total')).group_by(FuelUsage.machine_name).all()
    for r in res:
        usage_by_machine.append({"machine_name": r.machine_name, "total": r.total})
        
    return {
        "current_stock": float(current_stock),
        "total_spent": float(total_spent),
        "total_consumed": float(total_consumed),
        "usage_by_machine": usage_by_machine
    }

@router.get("/stock/available", response_model=List[schemas.FuelStockResponse])
def read_fuel_stock_available(db: Session = Depends(get_db)):
    return crud.get_fuel_stock_available(db)

@router.post("/stock", response_model=schemas.FuelStockResponse)
def create_fuel_stock(schema: schemas.FuelStockCreate, db: Session = Depends(get_db)):
    return crud.create_fuel_stock(db, schema)

@router.get("/stock", response_model=List[schemas.FuelStockResponse])
def read_fuel_stocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_fuel_stocks(db, skip=skip, limit=limit)

@router.get("/stock/{id}", response_model=schemas.FuelStockResponse)
def read_fuel_stock(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_fuel_stock(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/stock/{id}", response_model=schemas.FuelStockResponse)
def update_fuel_stock(id: int, schema: schemas.FuelStockUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_fuel_stock(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/stock/{id}")
def delete_fuel_stock(id: int, db: Session = Depends(get_db)):
    stock = crud.get_fuel_stock(db, id)
    if not stock:
        raise HTTPException(status_code=404, detail="Not found")
    if stock.liters_remaining != stock.liters_bought:
        raise HTTPException(status_code=400, detail="Cannot delete: Fuel already used in production")
    crud.delete_fuel_stock(db, id)
    return {"message": "Stock deleted successfully"}

@router.delete("/usage/{id}")
def delete_fuel_usage(id: int, db: Session = Depends(get_db)):
    usage = crud.get_fuel_usage(db, id)
    if not usage:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Add usage.liters_used BACK to stock.liters_remaining
    if hasattr(usage, 'stock_id') and usage.stock_id:
        stock = db.query(FuelStock).filter(FuelStock.id == usage.stock_id).first()
    else:
        stock = db.query(FuelStock).order_by(FuelStock.id.desc()).first()
        
    if stock:
        stock.liters_remaining += usage.liters_used
        
    crud.delete_fuel_usage(db, id)
    db.commit()
    return {"message": "Usage deleted and fuel returned to stock"}
@router.post("/usage", response_model=schemas.FuelUsageResponse)
def create_fuel_usage(schema: schemas.FuelUsageCreate, db: Session = Depends(get_db)):
    available_stock = db.query(func.sum(FuelStock.liters_remaining)).scalar() or 0
    if available_stock < schema.liters_used:
        raise HTTPException(status_code=400, detail="Not enough fuel in stock")

    stocks = db.query(FuelStock).filter(FuelStock.liters_remaining > 0).order_by(FuelStock.purchase_date.asc()).all()
    remaining_to_deduct = schema.liters_used

    for stock in stocks:
        if remaining_to_deduct <= 0:
            break
        if stock.liters_remaining >= remaining_to_deduct:
            stock.liters_remaining -= remaining_to_deduct
            remaining_to_deduct = 0
        else:
            remaining_to_deduct -= stock.liters_remaining
            stock.liters_remaining = 0

    db.commit()
    return crud.create_fuel_usage(db, schema)

@router.get("/usage", response_model=List[schemas.FuelUsageResponse])
def read_fuel_usages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_fuel_usages(db, skip=skip, limit=limit)

@router.get("/usage/{id}", response_model=schemas.FuelUsageResponse)
def read_fuel_usage(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_fuel_usage(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/usage/{id}", response_model=schemas.FuelUsageResponse)
def update_fuel_usage(id: int, schema: schemas.FuelUsageUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_fuel_usage(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj
