from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app import database, models
import logging

router = APIRouter(prefix="/analytics", tags=["Analytics"])
logger = logging.getLogger(__name__)

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(database.get_db)):
    try:
        # Total Revenue (Sales) - Sum of paid_amount from SalesOrder
        total_revenue = db.query(func.sum(models.SalesOrder.paid_amount)).scalar() or 0.0

        # Total Payroll (Sum of all PayrollLedger amounts - salaries paid and advances given)
        # Note: If CLEAR_DUES is also an amount given, it's counted as expense.
        total_payroll = db.query(func.sum(models.PayrollLedger.amount)).scalar() or 0.0

        # Total Fuel Cost (Sum of total_cost from FuelStock)
        total_fuel_cost = db.query(func.sum(models.FuelStock.total_cost)).scalar() or 0.0

        # Net Profit
        total_expenses = float(total_payroll) + float(total_fuel_cost)
        net_profit = float(total_revenue) - total_expenses

        # Top Drivers (Dispatch table count per driver)
        top_drivers_query = (
            db.query(models.Dispatch.driver_name, func.count(models.Dispatch.id).label("count"))
            .group_by(models.Dispatch.driver_name)
            .order_by(desc("count"))
            .limit(5)
            .all()
        )
        top_drivers = [{"name": row.driver_name, "count": row.count} for row in top_drivers_query if row.driver_name]

        return {
            "total_revenue": float(total_revenue),
            "total_payroll": float(total_payroll),
            "total_fuel_cost": float(total_fuel_cost),
            "net_profit": net_profit,
            "top_drivers": top_drivers
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        return {
            "total_revenue": 0,
            "total_payroll": 0,
            "total_fuel_cost": 0,
            "net_profit": 0,
            "top_drivers": []
        }
