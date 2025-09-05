from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# Association table for many-to-many relationship between users and interests
user_interests = Table(
    'user_interests',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('interest_id', Integer, ForeignKey('interests.id'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Many-to-many relationship with interests
    interests = relationship("Interest", secondary=user_interests, back_populates="users")

class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Many-to-many relationship with users
    users = relationship("User", secondary=user_interests, back_populates="interests")

class SignupVerification(Base):
    __tablename__ = "signup_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    failed_attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())