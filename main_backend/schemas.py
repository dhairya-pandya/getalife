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

# Login schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Interest schema
class InterestCreate(BaseModel):
    name: str

class InterestResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    
    # --- FIX: Moved Config class inside ---
    class Config:
        from_attributes = True

# Post and Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    author_id: int
    post_id: int
    parent_comment_id: Optional[int] = None
    created_at: datetime
    upvotes: int
    downvotes: int
    replies: List['CommentResponse'] = []

    # --- FIX: Moved Config class inside ---
    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    author_id: int
    created_at: datetime
    upvotes: int
    downvotes: int
    numberofcomments: int
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True

# ML Service Integration Schemas
class MLAnalysisRequest(BaseModel):
    text: str

class MLAnalysisResponse(BaseModel):
    label: str
    score: float

class MLSummaryRequest(BaseModel):
    text: str
    max_length: int = 1500
    min_length: int = 10

class MLSummaryResponse(BaseModel):
    summary: str

class MLEmbeddingRequest(BaseModel):
    content_id: str
    text: str

class MLEmbeddingResponse(BaseModel):
    status: str
    content_id: str

class MLSearchRequest(BaseModel):
    query: str
    top_k: int = 7

class MLSearchResponse(BaseModel):
    content_ids: List[str]

class MLEmotionRequest(BaseModel):
    text: str
    threshold: float = 0.3

class MLEmotionResponse(BaseModel):
    emotions: List[dict]