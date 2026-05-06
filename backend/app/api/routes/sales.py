from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import schemas, crud, models

router = APIRouter(prefix="/api/v1/sales", tags=["sales"])

@router.post("/orders", response_model=schemas.SalesOrderResponse)
def create_order(schema: schemas.SalesOrderCreate, db: Session = Depends(get_db)):
    return crud.create_sales_order(db, schema)

@router.get("/orders", response_model=List[schemas.SalesOrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = crud.get_sales_orders(db, skip=skip, limit=limit)
    return orders

@router.get("/orders/{id}", response_model=schemas.SalesOrderResponse)
def read_order(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_sales_order(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/orders/{id}", response_model=schemas.SalesOrderResponse)
def update_order(id: int, schema: schemas.SalesOrderUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_sales_order(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/orders/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):
    if not crud.delete_sales_order(db, id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

@router.post("/orders/{id}/payment", response_model=schemas.OrderPaymentResponse)
def create_order_payment(id: int, schema: schemas.OrderPaymentCreate, db: Session = Depends(get_db)):
    schema.order_id = id
    payment = crud.create_order_payment(db, schema)
    
    order = crud.get_sales_order(db, id)
    if order:
        order.paid_amount = round(float(order.paid_amount or 0) + float(schema.amount_received))
        
        if order.paid_amount >= order.total_amount and order.dispatched_qty >= order.total_qty:
            order.status = models.OrderStatus.Completed
            
        db.commit()
        db.refresh(order)
        
    return payment

@router.post("/orders/{id}/dispatch", response_model=schemas.DispatchResponse)
def create_order_dispatch(id: int, schema: schemas.DispatchCreate, db: Session = Depends(get_db)):
    schema.order_id = id
    dispatch = crud.create_dispatch(db, schema)
    
    order = crud.get_sales_order(db, id)
    if order:
        total_dispatched = db.query(func.sum(models.Dispatch.qty_dispatched)).filter(models.Dispatch.order_id == id).scalar() or 0
        order.dispatched_qty = total_dispatched
        
        if order.dispatched_qty >= order.total_qty and order.paid_amount >= order.total_amount:
            order.status = models.OrderStatus.Completed
            
        db.commit()
        db.refresh(order)
        
    return dispatch

@router.patch("/orders/{id}/force-close", response_model=schemas.SalesOrderResponse)
def force_close_order(id: int, close_reason: str, db: Session = Depends(get_db)):
    update_schema = schemas.SalesOrderUpdate(
        status=models.OrderStatus.Force_Closed,
        close_reason=close_reason
    )
    db_obj = crud.update_sales_order(db, id, update_schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.get("/dispatches", response_model=List[schemas.DispatchResponse])
def read_dispatches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_dispatches(db, skip=skip, limit=limit)

@router.delete("/dispatch/{id}")
def delete_dispatch(id: int, db: Session = Depends(get_db)):
    dispatch = crud.get_dispatch(db, id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    
    order_id = dispatch.order_id
    qty_to_subtract = dispatch.qty_dispatched
    
    # 1. Update order math FIRST
    order = crud.get_sales_order(db, order_id)
    if order:
        order.dispatched_qty = (order.dispatched_qty or 0) - qty_to_subtract
        
        # Safety: Never allow negative dispatched_qty
        if order.dispatched_qty < 0:
            order.dispatched_qty = 0
            
        # Move back to Active if it was completed
        if order.status == models.OrderStatus.Completed:
            order.status = models.OrderStatus.Active
        
        db.add(order)
    
    # 2. Delete the dispatch record
    if not crud.delete_dispatch(db, id):
        raise HTTPException(status_code=404, detail="Failed to delete dispatch")
        
    db.commit()
    return {"ok": True}
