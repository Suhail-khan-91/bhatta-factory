from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
from datetime import datetime, timezone
from app.database import get_db
from app.models import AppSettings

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    values: Any

@router.get("/{category}")
def get_setting(category: str, db: Session = Depends(get_db)):
    setting = db.query(AppSettings).filter(AppSettings.category == category).first()
    if setting:
        return {"category": setting.category, "values": setting.values}
    return {"category": category, "values": []}

@router.put("/{category}")
def update_setting(category: str, payload: SettingsUpdate, db: Session = Depends(get_db)):
    setting = db.query(AppSettings).filter(AppSettings.category == category).first()
    
    if category == "pricing":
        old_price = 14000
        if setting and isinstance(setting.values, dict) and "price_per_trawli" in setting.values:
            old_price = setting.values["price_per_trawli"]
            
        history = db.query(AppSettings).filter(AppSettings.category == "pricing_history").first()
        entry = {"price": old_price, "changed_at": datetime.now(timezone.utc).isoformat()}
        
        if history:
            hist_list = history.values if isinstance(history.values, list) else []
            history.values = hist_list + [entry]
        else:
            history = AppSettings(category="pricing_history", values=[entry])
            db.add(history)

    if setting:
        setting.values = payload.values
    else:
        setting = AppSettings(category=category, values=payload.values)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return {"category": setting.category, "values": setting.values}

@router.get("")
def get_all_settings(db: Session = Depends(get_db)):
    settings = db.query(AppSettings).all()
    return [{"category": s.category, "values": s.values} for s in settings]
