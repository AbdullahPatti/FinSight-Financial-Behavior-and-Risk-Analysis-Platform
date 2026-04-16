from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from Models.users import User
from Schemas.user import UserCreate, UserLogin, UserResponse, ProfileUpdate

router = APIRouter()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=user.password,
        plan="Free"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": db_user.full_name, "plan": db_user.plan}

@router.get("/profile", response_model=UserResponse)
def get_profile(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile")
def update_profile(update: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if update.full_name:
        user.full_name = update.full_name
    if update.plan:
        user.plan = update.plan
    db.commit()
    return {"message": "Profile updated"}

@router.put("/security/password")
def change_password(new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = new_password
    db.commit()
    return {"message": "Password updated successfully"}