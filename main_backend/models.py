from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Float, JSON
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

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=True) # Assuming you have a communities table
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    dominant_emotion = Column(String, default='neutral')
    emotions = Column(JSON, default=list)  # Store full emotion analysis
    emotion_confidence = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    numberofcomments = Column(Integer, default=0) # Note: 'numberofcomments' is unconventional, 'comment_count' is more standard

    author = relationship("User")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    toxicity_score = Column(Float, default=0.0)
    dominant_emotion = Column(String, default='neutral')
    emotions = Column(JSON, default=list)  # Store full emotion analysis
    emotion_confidence = Column(Float, default=0.0)
    is_flagged = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)

    author = relationship("User")
    post = relationship("Post", back_populates="comments")
    replies = relationship("Comment", back_populates="parent_comment", remote_side=[id])
    parent_comment = relationship("Comment", back_populates="replies", remote_side=[parent_comment_id])