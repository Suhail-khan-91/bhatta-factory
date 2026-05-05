from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/api/v1/employees", tags=["employees"])

@router.get("/active", response_model=List[schemas.EmployeeResponse])
def read_active_employees(db: Session = Depends(get_db)):
    return crud.get_active_employees(db)

@router.post("", response_model=schemas.EmployeeResponse)
def create_employee(schema: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db, schema)

@router.get("", response_model=List[schemas.EmployeeResponse])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_employees(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas.EmployeeResponse)
def read_employee(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_employee(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/{id}", response_model=schemas.EmployeeResponse)
def update_employee(id: int, schema: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_employee(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/{id}")
def delete_employee(id: int, db: Session = Depends(get_db)):
    if not crud.delete_employee(db, id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
