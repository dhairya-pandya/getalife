from sqlalchemy.orm import Session
from sqlalchemy import and_
import models, schemas, auth
from datetime import datetime, timedelta, timezone
from typing import List, Optional

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Interest CRUD operations
def get_interest_by_name(db: Session, name: str):
    return db.query(models.Interest).filter(models.Interest.name == name.lower()).first()

def create_interest(db: Session, name: str):
    db_interest = models.Interest(name=name.lower())
    db.add(db_interest)
    db.commit()
    db.refresh(db_interest)
    return db_interest

def get_or_create_interest(db: Session, name: str):
    interest = get_interest_by_name(db, name)
    if not interest:
        interest = create_interest(db, name)
    return interest

def add_user_interests(db: Session, user_id: int, interest_names: List[str]):
    user = get_user(db, user_id)
    if not user:
        return None
    
    for interest_name in interest_names:
        interest = get_or_create_interest(db, interest_name)
        if interest not in user.interests:
            user.interests.append(interest)
    
    db.commit()
    return user

def create_user_from_verification(db: Session, verification: models.SignupVerification):
    """
    Create a new user from a verified signup verification entry.
    """
    # Create new user from verification data (simplified to match your existing User model)
    db_user = models.User(
        email=verification.email,
        username=verification.username,
        hashed_password=verification.password_hash  # Using hashed_password to match your existing User model
    )
    
    # Add and commit the new user
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Delete the verification entry after successful user creation
    db.delete(verification)
    db.commit()
    
    return db_user

# Signup verification CRUD operations
def create_or_update_signup_verification(db: Session, email: str, username: str, password_hash: str, otp_hash: str, expires_at: datetime):
    verification = get_signup_verification(db, email)
    if verification:
        # Update existing entry if user tries to sign up again
        verification.username = username
        verification.password_hash = password_hash
        verification.otp_hash = otp_hash
        verification.expires_at = expires_at
        verification.failed_attempts = 0 # Reset attempts
    else:
        # Create a new entry for a new signup attempt
        verification = models.SignupVerification(
            email=email,
            username=username,
            password_hash=password_hash,
            otp_hash=otp_hash,
            expires_at=expires_at,
            failed_attempts=0
        )
        db.add(verification)
    
    db.commit()
    db.refresh(verification)
    return verification

def get_signup_verification(db: Session, email: str):
    return db.query(models.SignupVerification).filter(models.SignupVerification.email == email).first()

def update_signup_verification_attempts(db: Session, email: str, attempts: int):
    verification = get_signup_verification(db, email)
    if verification:
        verification.failed_attempts = attempts
        db.commit()
    return verification

def delete_signup_verification(db: Session, email: str):
    verification = get_signup_verification(db, email)
    if verification:
        db.delete(verification)
        db.commit()
    return verification