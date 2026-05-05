from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app import models, schemas

# Helper for generic operations
def _get(db: Session, model, id: int):
    return db.execute(select(model).where(model.id == id)).scalar_one_or_none()

def _get_all(db: Session, model, skip: int, limit: int):
    return list(db.execute(select(model).offset(skip).limit(limit)).scalars().all())

def _create(db: Session, model, schema):
    db_obj = model(**schema.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def _update(db: Session, model, id: int, schema):
    db_obj = _get(db, model, id)
    if db_obj:
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj

def _delete(db: Session, model, id: int):
    db_obj = _get(db, model, id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
        return True
    return False

# --- Employee ---
def get_employee(db: Session, id: int) -> Optional[models.Employee]:
    return _get(db, models.Employee, id)
def get_employees(db: Session, skip: int = 0, limit: int = 100) -> List[models.Employee]:
    return _get_all(db, models.Employee, skip, limit)
def create_employee(db: Session, schema: schemas.EmployeeCreate) -> models.Employee:
    return _create(db, models.Employee, schema)
def update_employee(db: Session, id: int, schema: schemas.EmployeeUpdate) -> Optional[models.Employee]:
    return _update(db, models.Employee, id, schema)
def delete_employee(db: Session, id: int) -> bool:
    return _delete(db, models.Employee, id)

def get_active_employees(db: Session) -> List[models.Employee]:
    return list(db.execute(select(models.Employee).where(models.Employee.is_active == True)).scalars().all())

# --- BrickTeam ---
def get_brick_team(db: Session, id: int) -> Optional[models.BrickTeam]:
    return _get(db, models.BrickTeam, id)
def get_brick_teams(db: Session, skip: int = 0, limit: int = 100) -> List[models.BrickTeam]:
    return _get_all(db, models.BrickTeam, skip, limit)
def create_brick_team(db: Session, schema: schemas.BrickTeamCreate) -> models.BrickTeam:
    return _create(db, models.BrickTeam, schema)
def update_brick_team(db: Session, id: int, schema: schemas.BrickTeamUpdate) -> Optional[models.BrickTeam]:
    return _update(db, models.BrickTeam, id, schema)
def delete_brick_team(db: Session, id: int) -> bool:
    return _delete(db, models.BrickTeam, id)

# --- DailyProduction ---
def get_daily_production(db: Session, id: int) -> Optional[models.DailyProduction]:
    return _get(db, models.DailyProduction, id)
def get_daily_productions(db: Session, skip: int = 0, limit: int = 100) -> List[models.DailyProduction]:
    return _get_all(db, models.DailyProduction, skip, limit)
def create_daily_production(db: Session, schema: schemas.DailyProductionCreate) -> models.DailyProduction:
    return _create(db, models.DailyProduction, schema)
def update_daily_production(db: Session, id: int, schema: schemas.DailyProductionUpdate) -> Optional[models.DailyProduction]:
    return _update(db, models.DailyProduction, id, schema)
def delete_daily_production(db: Session, id: int) -> bool:
    return _delete(db, models.DailyProduction, id)

# --- FuelStock ---
def get_fuel_stock(db: Session, id: int) -> Optional[models.FuelStock]:
    return _get(db, models.FuelStock, id)
def get_fuel_stocks(db: Session, skip: int = 0, limit: int = 100) -> List[models.FuelStock]:
    return _get_all(db, models.FuelStock, skip, limit)
def create_fuel_stock(db: Session, schema: schemas.FuelStockCreate) -> models.FuelStock:
    return _create(db, models.FuelStock, schema)
def update_fuel_stock(db: Session, id: int, schema: schemas.FuelStockUpdate) -> Optional[models.FuelStock]:
    return _update(db, models.FuelStock, id, schema)
def delete_fuel_stock(db: Session, id: int) -> bool:
    return _delete(db, models.FuelStock, id)

def get_fuel_stock_available(db: Session) -> List[models.FuelStock]:
    return list(db.execute(select(models.FuelStock).where(models.FuelStock.liters_remaining > 0)).scalars().all())

# --- FuelUsage ---
def get_fuel_usage(db: Session, id: int) -> Optional[models.FuelUsage]:
    return _get(db, models.FuelUsage, id)
def get_fuel_usages(db: Session, skip: int = 0, limit: int = 100) -> List[models.FuelUsage]:
    return _get_all(db, models.FuelUsage, skip, limit)
def create_fuel_usage(db: Session, schema: schemas.FuelUsageCreate) -> models.FuelUsage:
    return _create(db, models.FuelUsage, schema)
def update_fuel_usage(db: Session, id: int, schema: schemas.FuelUsageUpdate) -> Optional[models.FuelUsage]:
    return _update(db, models.FuelUsage, id, schema)
def delete_fuel_usage(db: Session, id: int) -> bool:
    return _delete(db, models.FuelUsage, id)

# --- ExtraWork ---
def get_extra_work(db: Session, id: int) -> Optional[models.ExtraWork]:
    return _get(db, models.ExtraWork, id)
def get_extra_works(db: Session, skip: int = 0, limit: int = 100) -> List[models.ExtraWork]:
    return _get_all(db, models.ExtraWork, skip, limit)
def create_extra_work(db: Session, schema: schemas.ExtraWorkCreate) -> models.ExtraWork:
    return _create(db, models.ExtraWork, schema)
def update_extra_work(db: Session, id: int, schema: schemas.ExtraWorkUpdate) -> Optional[models.ExtraWork]:
    return _update(db, models.ExtraWork, id, schema)
def delete_extra_work(db: Session, id: int) -> bool:
    return _delete(db, models.ExtraWork, id)

def get_unpaid_extra_work(db: Session, employee_id: int) -> List[models.ExtraWork]:
    return list(db.execute(select(models.ExtraWork).where(
        models.ExtraWork.employee_id == employee_id,
        models.ExtraWork.is_paid == False
    )).scalars().all())

# --- PayrollLedger ---
def get_payroll_ledger(db: Session, id: int) -> Optional[models.PayrollLedger]:
    return _get(db, models.PayrollLedger, id)
def get_payroll_ledgers(db: Session, skip: int = 0, limit: int = 100) -> List[models.PayrollLedger]:
    return _get_all(db, models.PayrollLedger, skip, limit)
def create_payroll_ledger(db: Session, schema: schemas.PayrollLedgerCreate) -> models.PayrollLedger:
    data = schema.model_dump(exclude={"cleared_dues"})
    db_obj = models.PayrollLedger(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
def update_payroll_ledger(db: Session, id: int, schema: schemas.PayrollLedgerUpdate) -> Optional[models.PayrollLedger]:
    return _update(db, models.PayrollLedger, id, schema)
def delete_payroll_ledger(db: Session, id: int) -> bool:
    return _delete(db, models.PayrollLedger, id)

def get_employee_payroll_history(db: Session, employee_id: int) -> List[models.PayrollLedger]:
    return list(db.execute(select(models.PayrollLedger).where(models.PayrollLedger.employee_id == employee_id)).scalars().all())

# --- SalaryHistory ---
def get_salary_history(db: Session, id: int) -> Optional[models.SalaryHistory]:
    return _get(db, models.SalaryHistory, id)
def get_salary_histories(db: Session, skip: int = 0, limit: int = 100) -> List[models.SalaryHistory]:
    return _get_all(db, models.SalaryHistory, skip, limit)
def create_salary_history(db: Session, schema: schemas.SalaryHistoryCreate) -> models.SalaryHistory:
    return _create(db, models.SalaryHistory, schema)
def update_salary_history(db: Session, id: int, schema: schemas.SalaryHistoryUpdate) -> Optional[models.SalaryHistory]:
    return _update(db, models.SalaryHistory, id, schema)
def delete_salary_history(db: Session, id: int) -> bool:
    return _delete(db, models.SalaryHistory, id)

# --- SalesOrder ---
def get_sales_order(db: Session, id: int) -> Optional[models.SalesOrder]:
    return _get(db, models.SalesOrder, id)
def get_sales_orders(db: Session, skip: int = 0, limit: int = 100) -> List[models.SalesOrder]:
    return _get_all(db, models.SalesOrder, skip, limit)
def create_sales_order(db: Session, schema: schemas.SalesOrderCreate) -> models.SalesOrder:
    return _create(db, models.SalesOrder, schema)
def update_sales_order(db: Session, id: int, schema: schemas.SalesOrderUpdate) -> Optional[models.SalesOrder]:
    return _update(db, models.SalesOrder, id, schema)
def delete_sales_order(db: Session, id: int) -> bool:
    return _delete(db, models.SalesOrder, id)

def get_orders_by_status(db: Session, status: models.OrderStatus) -> List[models.SalesOrder]:
    return list(db.execute(select(models.SalesOrder).where(models.SalesOrder.status == status)).scalars().all())

# --- OrderPayment ---
def get_order_payment(db: Session, id: int) -> Optional[models.OrderPayment]:
    return _get(db, models.OrderPayment, id)
def get_order_payments(db: Session, skip: int = 0, limit: int = 100) -> List[models.OrderPayment]:
    return _get_all(db, models.OrderPayment, skip, limit)
def create_order_payment(db: Session, schema: schemas.OrderPaymentCreate) -> models.OrderPayment:
    return _create(db, models.OrderPayment, schema)
def update_order_payment(db: Session, id: int, schema: schemas.OrderPaymentUpdate) -> Optional[models.OrderPayment]:
    return _update(db, models.OrderPayment, id, schema)
def delete_order_payment(db: Session, id: int) -> bool:
    return _delete(db, models.OrderPayment, id)

# --- Dispatch ---
def get_dispatch(db: Session, id: int) -> Optional[models.Dispatch]:
    return _get(db, models.Dispatch, id)
def get_dispatches(db: Session, skip: int = 0, limit: int = 100) -> List[models.Dispatch]:
    return _get_all(db, models.Dispatch, skip, limit)
def create_dispatch(db: Session, schema: schemas.DispatchCreate) -> models.Dispatch:
    return _create(db, models.Dispatch, schema)
def update_dispatch(db: Session, id: int, schema: schemas.DispatchUpdate) -> Optional[models.Dispatch]:
    return _update(db, models.Dispatch, id, schema)
def delete_dispatch(db: Session, id: int) -> bool:
    return _delete(db, models.Dispatch, id)
