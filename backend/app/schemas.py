from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from app.models import PayrollTransactionType, OrderMode, OrderStatus

# --- Employee ---
class EmployeeBase(BaseModel):
    full_name: str
    employee_category: str
    pay_frequency: str
    base_salary: Decimal
    gender: Optional[str] = None
    religion: Optional[str] = None
    age: Optional[int] = None
    boss_contractor_name: Optional[str] = None
    home_city: Optional[str] = None
    joining_date: date
    document_url: Optional[str] = None
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    employee_category: Optional[str] = None
    pay_frequency: Optional[str] = None
    base_salary: Optional[Decimal] = None
    gender: Optional[str] = None
    religion: Optional[str] = None
    age: Optional[int] = None
    boss_contractor_name: Optional[str] = None
    home_city: Optional[str] = None
    joining_date: Optional[date] = None
    document_url: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- BrickTeam ---
class BrickTeamBase(BaseModel):
    team_number: int
    team_name: str
    location_tag: Optional[str] = None

class BrickTeamCreate(BrickTeamBase):
    pass

class BrickTeamUpdate(BaseModel):
    team_number: Optional[int] = None
    team_name: Optional[str] = None
    location_tag: Optional[str] = None

class BrickTeamResponse(BrickTeamBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- DailyProduction ---
class DailyProductionBase(BaseModel):
    team_id: int
    bricks_count: int
    entry_date: date
    logged_by: str

class DailyProductionCreate(DailyProductionBase):
    pass

class DailyProductionUpdate(BaseModel):
    team_id: Optional[int] = None
    bricks_count: Optional[int] = None
    entry_date: Optional[date] = None
    logged_by: Optional[str] = None

class DailyProductionResponse(DailyProductionBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- FuelStock ---
class FuelStockBase(BaseModel):
    liters_bought: Decimal
    liters_remaining: Decimal
    station_name: str
    purchaser_name: str
    total_cost: Decimal
    purchase_date: datetime
    receipt_image_url: Optional[str] = None

class FuelStockCreate(FuelStockBase):
    pass

class FuelStockUpdate(BaseModel):
    liters_bought: Optional[Decimal] = None
    liters_remaining: Optional[Decimal] = None
    station_name: Optional[str] = None
    purchaser_name: Optional[str] = None
    total_cost: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    receipt_image_url: Optional[str] = None

class FuelStockResponse(FuelStockBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- FuelUsage ---
class FuelUsageBase(BaseModel):
    machine_name: str
    liters_used: Decimal
    given_by: str
    usage_date: datetime
    logged_by: str

class FuelUsageCreate(FuelUsageBase):
    pass

class FuelUsageUpdate(BaseModel):
    machine_name: Optional[str] = None
    liters_used: Optional[Decimal] = None
    given_by: Optional[str] = None
    usage_date: Optional[datetime] = None
    logged_by: Optional[str] = None

class FuelUsageResponse(FuelUsageBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- ExtraWork ---
class ExtraWorkBase(BaseModel):
    employee_id: int
    work_name: str
    amount: Decimal
    date_logged: date
    is_paid: bool = False
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None

class ExtraWorkCreate(ExtraWorkBase):
    pass

class ExtraWorkUpdate(BaseModel):
    employee_id: Optional[int] = None
    work_name: Optional[str] = None
    amount: Optional[Decimal] = None
    date_logged: Optional[date] = None
    is_paid: Optional[bool] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None

class ExtraWorkResponse(ExtraWorkBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- PayrollLedger ---
class PayrollLedgerBase(BaseModel):
    employee_id: int
    transaction_type: PayrollTransactionType
    amount: Decimal
    base_salary: Optional[Decimal] = None
    due_created: Decimal = Decimal('0.0')
    advance_deducted: Decimal = Decimal('0.0')
    payment_method: str
    transaction_date: date

class PayrollLedgerCreate(PayrollLedgerBase):
    cleared_dues: Optional[list[int]] = None

class PayrollLedgerUpdate(BaseModel):
    employee_id: Optional[int] = None
    transaction_type: Optional[PayrollTransactionType] = None
    amount: Optional[Decimal] = None
    base_salary: Optional[Decimal] = None
    due_created: Optional[Decimal] = None
    advance_deducted: Optional[Decimal] = None
    payment_method: Optional[str] = None
    transaction_date: Optional[date] = None

class PayrollLedgerResponse(PayrollLedgerBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- SalaryHistory ---
class SalaryHistoryBase(BaseModel):
    employee_id: int
    old_salary: Decimal
    new_salary: Decimal
    old_pay_type: str
    new_pay_type: str
    change_date: date

class SalaryHistoryCreate(SalaryHistoryBase):
    pass

class SalaryHistoryUpdate(BaseModel):
    employee_id: Optional[int] = None
    old_salary: Optional[Decimal] = None
    new_salary: Optional[Decimal] = None
    old_pay_type: Optional[str] = None
    new_pay_type: Optional[str] = None
    change_date: Optional[date] = None

class SalaryHistoryResponse(SalaryHistoryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- SalesOrder ---
class SalesOrderBase(BaseModel):
    order_mode: OrderMode
    brick_category: str
    customer_name: str
    customer_mobile: str
    customer_address: str
    order_date: date
    lead_source: Optional[str] = None
    salesperson: Optional[str] = None
    total_qty: int
    price_per_trawli: Optional[Decimal] = None
    total_amount: Decimal
    paid_amount: Decimal = Decimal('0.0')
    dispatched_qty: int = 0
    status: OrderStatus = OrderStatus.Active
    close_reason: Optional[str] = None
    timestamp: datetime

class SalesOrderCreate(SalesOrderBase):
    pass

class SalesOrderUpdate(BaseModel):
    order_mode: Optional[OrderMode] = None
    brick_category: Optional[str] = None
    customer_name: Optional[str] = None
    customer_mobile: Optional[str] = None
    customer_address: Optional[str] = None
    order_date: Optional[date] = None
    lead_source: Optional[str] = None
    salesperson: Optional[str] = None
    total_qty: Optional[int] = None
    price_per_trawli: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    paid_amount: Optional[Decimal] = None
    dispatched_qty: Optional[int] = None
    status: Optional[OrderStatus] = None
    close_reason: Optional[str] = None
    timestamp: Optional[datetime] = None

class SalesOrderResponse(SalesOrderBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- OrderPayment ---
class OrderPaymentBase(BaseModel):
    order_id: int
    amount_received: Decimal
    payment_method: str
    received_by: str
    timestamp: datetime

class OrderPaymentCreate(OrderPaymentBase):
    pass

class OrderPaymentUpdate(BaseModel):
    order_id: Optional[int] = None
    amount_received: Optional[Decimal] = None
    payment_method: Optional[str] = None
    received_by: Optional[str] = None
    timestamp: Optional[datetime] = None

class OrderPaymentResponse(OrderPaymentBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Dispatch ---
class DispatchBase(BaseModel):
    order_id: int
    driver_name: str
    qty_dispatched: int
    timestamp: datetime

class DispatchCreate(DispatchBase):
    pass

class DispatchUpdate(BaseModel):
    order_id: Optional[int] = None
    driver_name: Optional[str] = None
    qty_dispatched: Optional[int] = None
    timestamp: Optional[datetime] = None

class DispatchResponse(DispatchBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
