from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/api/v1/payroll", tags=["payroll"])

@router.get("/ledger/{employee_id}", response_model=List[schemas.PayrollLedgerResponse])
def read_employee_ledger(employee_id: int, db: Session = Depends(get_db)):
    return crud.get_employee_payroll_history(db, employee_id)

@router.get("/ledger", response_model=List[schemas.PayrollLedgerResponse])
def read_payroll_ledgers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_payroll_ledgers(db, skip=skip, limit=limit)

@router.get("/ledger_item/{id}", response_model=schemas.PayrollLedgerResponse)
def read_payroll_ledger_item(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_payroll_ledger(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/ledger_item/{id}", response_model=schemas.PayrollLedgerResponse)
def update_payroll_ledger_item(id: int, schema: schemas.PayrollLedgerUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_payroll_ledger(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/{transaction_id}")
def delete_payroll_transaction(transaction_id: int, db: Session = Depends(get_db)):
    # 1. Fetch the payroll transaction
    transaction = crud.get_payroll_ledger(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # 2. Fetch linked employee
    employee = crud.get_employee(db, transaction.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Handle Balance Reversal Math before deleting
    if transaction.transaction_type == "CLEAR_DUES":
        employee.pending_dues = getattr(employee, "pending_dues", 0) + transaction.amount
    elif transaction.transaction_type == "SALARY":
        shortfall = (transaction.base_salary or 0) - transaction.amount
        employee.pending_dues = getattr(employee, "pending_dues", 0) - shortfall
    elif transaction.transaction_type == "ADVANCE_GIVEN":
        employee.total_advances = getattr(employee, "total_advances", 0) - transaction.amount
        
    db.add(employee)
    db.commit()
    db.refresh(employee)

    # 3. Delete the transaction record
    if not crud.delete_payroll_ledger(db, transaction_id):
        raise HTTPException(status_code=500, detail="Failed to delete transaction")
        
    return {"ok": True}

@router.delete("/ledger_item/{id}")
def delete_payroll_ledger_item(id: int, db: Session = Depends(get_db)):
    if not crud.delete_payroll_ledger(db, id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

@router.post("/advance", response_model=schemas.PayrollLedgerResponse)
def create_advance(schema: schemas.PayrollLedgerCreate, db: Session = Depends(get_db)):
    return crud.create_payroll_ledger(db, schema)

@router.post("/salary", response_model=schemas.PayrollLedgerResponse)
def create_salary(schema: schemas.PayrollLedgerCreate, db: Session = Depends(get_db)):
    employee = crud.get_employee(db, schema.employee_id)
    if employee and schema.transaction_type == "CLEAR_DUES":
        employee.pending_dues = getattr(employee, "pending_dues", 0) - schema.amount
        db.add(employee)
        
        # Update the status of the specific ledger records being paid
        if getattr(schema, "cleared_dues", None):
            remaining_payment = schema.amount
            for due_id in schema.cleared_dues:
                due_record = crud.get_payroll_ledger(db, due_id)
                if due_record and due_record.due_created > 0:
                    if remaining_payment >= due_record.due_created:
                        remaining_payment -= due_record.due_created
                        due_record.due_created = 0
                    else:
                        due_record.due_created -= remaining_payment
                        remaining_payment = 0
                    db.add(due_record)

        db.commit()
        db.refresh(employee)
    return crud.create_payroll_ledger(db, schema)

@router.post("/extra-work", response_model=schemas.ExtraWorkResponse)
def create_extra_work(schema: schemas.ExtraWorkCreate, db: Session = Depends(get_db)):
    return crud.create_extra_work(db, schema)

@router.get("/extra-work/unpaid/{employee_id}", response_model=List[schemas.ExtraWorkResponse])
def read_unpaid_extra_work(employee_id: int, db: Session = Depends(get_db)):
    return crud.get_unpaid_extra_work(db, employee_id)

@router.get("/extra-work", response_model=List[schemas.ExtraWorkResponse])
def read_extra_works(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_extra_works(db, skip=skip, limit=limit)

@router.get("/extra-work/{id}", response_model=schemas.ExtraWorkResponse)
def read_extra_work(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_extra_work(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/extra-work/{id}", response_model=schemas.ExtraWorkResponse)
def update_extra_work(id: int, schema: schemas.ExtraWorkUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_extra_work(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/extra-work/{id}")
def delete_extra_work(id: int, db: Session = Depends(get_db)):
    if not crud.delete_extra_work(db, id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
