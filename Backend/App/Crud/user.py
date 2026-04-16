from sqlalchemy.orm import Session
from Models.users import User
from Schemas.user import UserCreate, ProfileUpdate

def create_user(db: Session, user: UserCreate):
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=user.password,
        plan="Free"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_first_user(db: Session):
    return db.query(User).first()

def update_user_profile(db: Session, update: ProfileUpdate):
    user = get_first_user(db)
    if not user:
        return None
    if update.full_name:
        user.full_name = update.full_name
    if update.plan:
        user.plan = update.plan
    db.commit()
    db.refresh(user)
    return user