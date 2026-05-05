from fastapi import APIRouter
from app.api.routes import employees, brick_teams, daily_production, fuel, payroll, sales, settings, calculator, analytics

router = APIRouter()

router.include_router(employees.router)
router.include_router(brick_teams.router)
router.include_router(daily_production.router)
router.include_router(fuel.router)
router.include_router(payroll.router)
router.include_router(sales.router)
router.include_router(settings.router)
router.include_router(calculator.router)
router.include_router(analytics.router)
