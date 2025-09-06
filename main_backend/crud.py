from sqlalchemy.orm import Session
from sqlalchemy import and_
import models, schemas, auth
from datetime import datetime
from typing import List, Optional
import asyncio
from ml_client import ml_client

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

async def create_post(db: Session, post: schemas.PostCreate, author_id: int, community_id: Optional[int] = None):
    # Create post first
    db_post = models.Post(
        title=post.title,
        content=post.content,
        author_id=author_id,
        community_id=community_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Analyze emotions and store embedding asynchronously
    try:
        full_content = f"{post.title} {post.content}"
        
        # Analyze emotions
        emotion_request = schemas.MLPostEmotionRequest(
            post_id=str(db_post.id),
            post_content=full_content
        )
        emotion_result = await ml_client.analyze_post_emotions(emotion_request)
        
        if emotion_result:
            db_post.dominant_emotion = emotion_result.dominant_emotion
            db_post.emotions = emotion_result.emotions
            db_post.emotion_confidence = emotion_result.confidence
            
        # Store embedding for semantic search
        embedding_request = schemas.MLEmbeddingRequest(
            content_id=str(db_post.id),
            text=full_content
        )
        await ml_client.store_post_embedding(embedding_request)
        
        db.commit()
        db.refresh(db_post)
    except Exception as e:
        print(f"Failed to analyze post emotions or store embedding: {e}")
        # Don't fail the post creation if analysis fails
    
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 25):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

# --- NEW: Function to get posts for a specific community ---
def get_posts_by_community(db: Session, community_id: int, skip: int = 0, limit: int = 25):
    return db.query(models.Post).filter(models.Post.community_id == community_id).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()

async def create_comment(db: Session, comment: schemas.CommentCreate, post_id: int, author_id: int, parent_comment_id: Optional[int] = None):
    # Update post comment count
    db.query(models.Post).filter(models.Post.id == post_id).update({"numberofcomments": models.Post.numberofcomments + 1})
    
    # Create comment
    db_comment = models.Comment(
        content=comment.content,
        post_id=post_id,
        author_id=author_id,
        parent_comment_id=parent_comment_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Analyze comment emotions
    try:
        emotion_request = schemas.MLEmotionRequest(text=comment.content)
        emotion_result = await ml_client.analyze_emotions(emotion_request)
        
        if emotion_result and emotion_result.emotions:
            # Store the dominant emotion and full emotion analysis
            if emotion_result.emotions:
                top_emotion = emotion_result.emotions[0]
                db_comment.dominant_emotion = top_emotion.get('emotion', 'neutral')
                db_comment.emotions = emotion_result.emotions
                db_comment.emotion_confidence = float(top_emotion.get('probability', 0.0))
            
            db.commit()
            db.refresh(db_comment)
    except Exception as e:
        print(f"Failed to analyze comment emotions: {e}")
    
    # Trigger discussion emotion analysis for the post
    try:
        await update_discussion_emotions(db, post_id)
    except Exception as e:
        print(f"Failed to update discussion emotions: {e}")
    
    return db_comment

# --- NEW: Function to get all comments for a post ---
def get_comments_by_post(db: Session, post_id: int):
    return db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()

# --- NEW: Function to update discussion emotions ---
async def update_discussion_emotions(db: Session, post_id: int):
    """Update the overall emotions of a post based on its content and comments"""
    try:
        # Get post and its comments
        post = get_post(db, post_id)
        if not post:
            return
            
        comments = get_comments_by_post(db, post_id)
        comment_texts = [comment.content for comment in comments]
        
        # Analyze discussion emotions
        discussion_request = schemas.MLDiscussionEmotionRequest(
            post_id=str(post_id),
            post_content=f"{post.title} {post.content}",
            comments=comment_texts
        )
        
        discussion_result = await ml_client.analyze_discussion_emotions(discussion_request)
        
        if discussion_result:
            # Update post with overall discussion emotions
            post.dominant_emotion = discussion_result.overall_dominant_emotion
            post.emotion_confidence = discussion_result.confidence
            # You could also store the full emotion breakdown if needed
            db.commit()
            db.refresh(post)
            
    except Exception as e:
        print(f"Failed to update discussion emotions for post {post_id}: {e}")

# --- NEW: Get discussion emotion analysis ---
async def get_discussion_emotion_analysis(db: Session, post_id: int):
    """Get detailed emotion analysis for a discussion"""
    try:
        post = get_post(db, post_id)
        if not post:
            return None
            
        comments = get_comments_by_post(db, post_id)
        comment_texts = [comment.content for comment in comments]
        
        discussion_request = schemas.MLDiscussionEmotionRequest(
            post_id=str(post_id),
            post_content=f"{post.title} {post.content}",
            comments=comment_texts
        )
        
        return await ml_client.analyze_discussion_emotions(discussion_request)
        
    except Exception as e:
        print(f"Failed to get discussion emotion analysis for post {post_id}: {e}")
        return None

# --- NEW: Semantic search function ---
async def semantic_search_posts(db: Session, query: str, limit: int = 10, threshold: float = 0.7):
    """Search for posts using semantic similarity"""
    try:
        search_request = schemas.MLSemanticSearchRequest(
            query=query,
            limit=limit,
            threshold=threshold
        )
        
        search_result = await ml_client.semantic_search(search_request)
        
        if search_result and search_result.results:
            # Get post details from database
            post_ids = [int(result["post_id"]) for result in search_result.results]
            posts = db.query(models.Post).filter(models.Post.id.in_(post_ids)).all()
            
            # Create a mapping for quick lookup
            post_map = {post.id: post for post in posts}
            
            # Combine ML results with database posts
            enriched_results = []
            for result in search_result.results:
                post_id = int(result["post_id"])
                if post_id in post_map:
                    post = post_map[post_id]
                    enriched_results.append({
                        "post": post,
                        "similarity": result["similarity"],
                        "content_preview": result.get("content", "")[:200] + "..."
                    })
            
            return {
                "query": query,
                "results": enriched_results,
                "total_results": len(enriched_results)
            }
        
        return {"query": query, "results": [], "total_results": 0}
        
    except Exception as e:
        print(f"Failed to perform semantic search: {e}")
        return {"query": query, "results": [], "total_results": 0}