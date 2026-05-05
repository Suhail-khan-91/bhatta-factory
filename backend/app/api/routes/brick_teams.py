from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/api/v1/brick_teams", tags=["brick_teams"])

@router.post("", response_model=schemas.BrickTeamResponse)
def create_brick_team(schema: schemas.BrickTeamCreate, db: Session = Depends(get_db)):
    return crud.create_brick_team(db, schema)

@router.get("", response_model=List[schemas.BrickTeamResponse])
def read_brick_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_brick_teams(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas.BrickTeamResponse)
def read_brick_team(id: int, db: Session = Depends(get_db)):
    db_obj = crud.get_brick_team(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.patch("/{id}", response_model=schemas.BrickTeamResponse)
def update_brick_team(id: int, schema: schemas.BrickTeamUpdate, db: Session = Depends(get_db)):
    db_obj = crud.update_brick_team(db, id, schema)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return db_obj

@router.delete("/{id}")
def delete_brick_team(id: int, db: Session = Depends(get_db)):
    if not crud.delete_brick_team(db, id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
