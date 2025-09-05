from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    interests: List[str] = []

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    interests: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Signup flow schemas
class SignupStart(BaseModel):
    username: str
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class SignupComplete(BaseModel):
    email: EmailStr
    interests: List[str]

# Login schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    user: UserResponse

# Interest schema
class InterestCreate(BaseModel):
    name: str

class InterestResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True