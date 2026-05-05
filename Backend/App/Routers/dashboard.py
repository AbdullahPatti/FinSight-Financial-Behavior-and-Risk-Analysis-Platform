from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from App.db import get_db
from App.Crud.dashboard import get_dashboard_data
from App.Schemas.dashboard import DashboardResponse
from App.Models.users import User
from App.Routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← requires valid JWT
):
    """
    Get comprehensive financial dashboard data.
    Only accessible to authenticated users.
    """
    try:
        data = get_dashboard_data(db, current_user.id)
        return data
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise