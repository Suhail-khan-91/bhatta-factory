from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Numeric, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class AppSettings(Base):
    __tablename__ = "app_settings"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, nullable=False)
    values = Column(JSON, nullable=False, default=[])
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    employee_category = Column(String, nullable=False)
    pay_frequency = Column(String, nullable=False)
    base_salary = Column(Numeric(10, 2), nullable=False)
    gender = Column(String, nullable=True)
    religion = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    boss_contractor_name = Column(String, nullable=True)
    home_city = Column(String, nullable=True)
    joining_date = Column(Date, nullable=False)
    document_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    payroll_ledger = relationship("PayrollLedger", back_populates="employee")
    salary_history = relationship("SalaryHistory", back_populates="employee")
    extra_work = relationship("ExtraWork", back_populates="employee")

    def __repr__(self):
        return f"<Employee(id={self.id}, full_name={self.full_name})>"


class BrickTeam(Base):
    __tablename__ = "brick_teams"
    id = Column(Integer, primary_key=True, index=True)
    team_number = Column(Integer, nullable=False, unique=True)
    team_name = Column(String, nullable=False)
    location_tag = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    daily_productions = relationship("DailyProduction", back_populates="team")

    def __repr__(self):
        return f"<BrickTeam(id={self.id}, team_name={self.team_name})>"


class DailyProduction(Base):
    __tablename__ = "daily_productions"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("brick_teams.id"), nullable=False)
    bricks_count = Column(Integer, nullable=False)
    entry_date = Column(Date, nullable=False)
    logged_by = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    team = relationship("BrickTeam", back_populates="daily_productions")

    def __repr__(self):
        return f"<DailyProduction(id={self.id}, team_id={self.team_id})>"


class FuelStock(Base):
    __tablename__ = "fuel_stocks"
    id = Column(Integer, primary_key=True, index=True)
    liters_bought = Column(Numeric(8, 2), nullable=False)
    liters_remaining = Column(Numeric(8, 2), nullable=False)
    station_name = Column(String, nullable=False)
    purchaser_name = Column(String, nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)
    purchase_date = Column(DateTime(timezone=True), nullable=False)
    receipt_image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<FuelStock(id={self.id}, station_name={self.station_name})>"


class FuelUsage(Base):
    __tablename__ = "fuel_usages"
    id = Column(Integer, primary_key=True, index=True)
    machine_name = Column(String, nullable=False)
    liters_used = Column(Numeric(8, 2), nullable=False)
    given_by = Column(String, nullable=False)
    usage_date = Column(DateTime(timezone=True), nullable=False)
    logged_by = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<FuelUsage(id={self.id}, machine_name={self.machine_name})>"


class ExtraWork(Base):
    __tablename__ = "extra_works"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    work_name = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    date_logged = Column(Date, nullable=False)
    is_paid = Column(Boolean, default=False)
    payment_date = Column(Date, nullable=True)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="extra_work")

    def __repr__(self):
        return f"<ExtraWork(id={self.id}, work_name={self.work_name})>"


class PayrollTransactionType(str, enum.Enum):
    SALARY = "SALARY"
    CLEAR_DUES = "CLEAR_DUES"
    ADVANCE_GIVEN = "ADVANCE_GIVEN"


class PayrollLedger(Base):
    __tablename__ = "payroll_ledgers"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    transaction_type = Column(SQLEnum(PayrollTransactionType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    base_salary = Column(Numeric(10, 2), nullable=True)
    due_created = Column(Numeric(10, 2), default=0)
    advance_deducted = Column(Numeric(10, 2), default=0)
    payment_method = Column(String, nullable=False)
    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="payroll_ledger")

    def __repr__(self):
        return f"<PayrollLedger(id={self.id}, transaction_type={self.transaction_type})>"


class SalaryHistory(Base):
    __tablename__ = "salary_histories"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    old_salary = Column(Numeric(10, 2), nullable=False)
    new_salary = Column(Numeric(10, 2), nullable=False)
    old_pay_type = Column(String, nullable=False)
    new_pay_type = Column(String, nullable=False)
    change_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="salary_history")

    def __repr__(self):
        return f"<SalaryHistory(id={self.id}, employee_id={self.employee_id})>"


class OrderMode(str, enum.Enum):
    trawli = "trawli"
    custom = "custom"


class OrderStatus(str, enum.Enum):
    Active = "Active"
    Completed = "Completed"
    Cancelled = "Cancelled"
    Force_Closed = "Force_Closed"


class SalesOrder(Base):
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True, index=True)
    order_mode = Column(SQLEnum(OrderMode), nullable=False)
    brick_category = Column(String, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_mobile = Column(String, nullable=False)
    customer_address = Column(Text, nullable=False)
    order_date = Column(Date, nullable=False)
    lead_source = Column(String, nullable=True)
    salesperson = Column(String, nullable=True)
    total_qty = Column(Integer, nullable=False)
    price_per_trawli = Column(Numeric(10, 2), nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=0)
    dispatched_qty = Column(Integer, default=0)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.Active)
    close_reason = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    payments = relationship("OrderPayment", back_populates="order")
    dispatches = relationship("Dispatch", back_populates="order")

    def __repr__(self):
        return f"<SalesOrder(id={self.id}, customer_name={self.customer_name})>"


class OrderPayment(Base):
    __tablename__ = "order_payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False)
    amount_received = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String, nullable=False)
    received_by = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("SalesOrder", back_populates="payments")

    def __repr__(self):
        return f"<OrderPayment(id={self.id}, order_id={self.order_id})>"


class Dispatch(Base):
    __tablename__ = "dispatches"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False)
    driver_name = Column(String, nullable=False)
    qty_dispatched = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("SalesOrder", back_populates="dispatches")

    def __repr__(self):
        return f"<Dispatch(id={self.id}, order_id={self.order_id})>"

class CalculatorHistory(Base):
    __tablename__ = "calculator_history"
    id = Column(Integer, primary_key=True, index=True)
    expression = Column(String, nullable=False)
    result = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
