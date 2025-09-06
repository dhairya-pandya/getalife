from sqlalchemy.orm import Session
from sqlalchemy import and_
import models, schemas, auth
from datetime import datetime
from typing import List, Optional

# --- User CRUD operations ---
# (No changes needed here)
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user_from_verification(db: Session, verification: models.SignupVerification):
    db_user = models.User(
        email=verification.email,
        username=verification.username,
        hashed_password=verification.password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Interest CRUD operations ---
# (No changes needed here)
def get_or_create_interest(db: Session, name: str):
    interest = db.query(models.Interest).filter(models.Interest.name == name.lower()).first()
    if not interest:
        interest = models.Interest(name=name.lower())
        db.add(interest)
        db.commit()
        db.refresh(interest)
    return interest

def add_user_interests(db: Session, user_id: int, interest_names: List[str]):
    user = get_user(db, user_id)
    if not user: return None
    for name in interest_names:
        interest = get_or_create_interest(db, name)
        if interest not in user.interests:
            user.interests.append(interest)
    db.commit()
    return user

# --- Signup verification CRUD operations ---
# (No changes needed here)
def create_or_update_signup_verification(db: Session, email: str, username: str, password_hash: str, otp_hash: str, expires_at: datetime):
    verification = get_signup_verification(db, email)
    if verification:
        verification.username, verification.password_hash, verification.otp_hash, verification.expires_at, verification.failed_attempts = username, password_hash, otp_hash, expires_at, 0
    else:
        verification = models.SignupVerification(email=email, username=username, password_hash=password_hash, otp_hash=otp_hash, expires_at=expires_at, failed_attempts=0)
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

# --- Post and Comment CRUD operations ---

def create_post(db: Session, post: schemas.PostCreate, author_id: int, community_id: Optional[int] = None):
    db_post = models.Post(
        title=post.title,
        content=post.content,
        author_id=author_id,
        community_id=community_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 25):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

# --- NEW: Function to get posts for a specific community ---
def get_posts_by_community(db: Session, community_id: int, skip: int = 0, limit: int = 25):
    return db.query(models.Post).filter(models.Post.community_id == community_id).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

def create_comment(db: Session, comment: schemas.CommentCreate, post_id: int, author_id: int, parent_comment_id: Optional[int] = None):
    db.query(models.Post).filter(models.Post.id == post_id).update({"numberofcomments": models.Post.numberofcomments + 1})
    db_comment = models.Comment(
        content=comment.content,
        post_id=post_id,
        author_id=author_id,
        parent_comment_id=parent_comment_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# --- NEW: Function to get all comments for a post ---
def get_comments_by_post(db: Session, post_id: int):
    return db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()