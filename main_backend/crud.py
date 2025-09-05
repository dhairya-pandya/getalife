from sqlalchemy.orm import Session
from . import models, schemas, auth

# ... other get functions (get_user, get_user_by_username)...

# UPDATED create_user function
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        interests=user.interests  # ADDED THIS LINE
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_userW