from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from Crud.dashboard import get_dashboard_data

router = APIRouter()

@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_data(db)