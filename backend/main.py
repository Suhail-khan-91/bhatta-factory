from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import check_db_connection, SessionLocal
from app.api.router import router as api_router
from app.models import AppSettings

app = FastAPI(title="Batta API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Seed default settings if empty
        if db.query(AppSettings).count() == 0:
            defaults = [
                AppSettings(category="gas_stations", values=["Petrol Pump 1", "Petrol Pump 2", "Reliance Pump", "Bharat Petroleum"]),
                AppSettings(category="machines", values=["JCB", "Tractor", "Generator", "Water Pump"]),
                AppSettings(category="lead_sources", values=["Master", "Phone", "Reference", "Walk-in"]),
                AppSettings(category="brick_categories", values=["Red", "Fly Ash", "Heavy"]),
                AppSettings(category="salespersons", values=["Master"]),
                AppSettings(category="drivers", values=["Ali", "Raju"]),
                AppSettings(category="pricing", values={"price_per_trawli": 14000})
            ]
            db.add_all(defaults)
            db.commit()
    except Exception as e:
        pass
    finally:
        db.close()

@app.get("/health")
def health_check():
    db_status = check_db_connection()
    return {"status": "ok", "db": db_status}
