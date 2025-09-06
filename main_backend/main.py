import random
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Annotated
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

# Import your other modules
import crud, models, schemas, auth
from database import SessionLocal, engine, get_db
from ml_client import ml_client

# This line creates your database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# --- CREATE THE APP INSTANCE HERE ---
app = FastAPI()

# --- ADD CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE DEPENDENCY ---
# Note: get_db is now imported from database.py

# --- JWT AND SECURITY SETUP ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

# --- AUTHENTICATION ROUTES ---

@app.post("/signup/start", status_code=200)
def signup_start(user_data: schemas.SignupStart, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, email=user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, username=user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    otp = str(random.randint(100000, 999999))
    print(f"Generated OTP for {user_data.email}: {otp}")

    password_hash = auth.get_password_hash(user_data.password)
    otp_hash = auth.get_password_hash(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    crud.create_or_update_signup_verification(
        db, email=user_data.email, username=user_data.username,
        password_hash=password_hash, otp_hash=otp_hash, expires_at=expires_at
    )
    
    email_sent = auth.send_otp_email(user_data.email, otp)
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send OTP email.")
        
    return {"message": "OTP has been sent to your email."}

@app.post("/signup/verify-otp", status_code=200)
def verify_otp(otp_data: schemas.OTPVerify, db: Session = Depends(get_db)):
    verification_entry = crud.get_signup_verification(db, email=otp_data.email)
    
    if not verification_entry:
        raise HTTPException(status_code=404, detail="Verification process not started.")
    
    if verification_entry.expires_at < datetime.now(timezone.utc):
        crud.delete_signup_verification(db, email=otp_data.email)
        raise HTTPException(status_code=400, detail="OTP has expired. Please sign up again.")

    if not auth.verify_password(otp_data.otp, verification_entry.otp_hash):
        current_attempts = verification_entry.failed_attempts + 1
        crud.update_signup_verification_attempts(db, email=otp_data.email, attempts=current_attempts)
        
        if current_attempts >= 5:
            crud.delete_signup_verification(db, email=otp_data.email)
            raise HTTPException(status_code=401, detail="Too many failed attempts. Please sign up again.")
        raise HTTPException(status_code=401, detail="Invalid OTP.")

    return {"message": "OTP verified successfully. Please select your interests."}

@app.post("/signup/complete", response_model=schemas.UserResponse, status_code=201)
def signup_complete(completion_data: schemas.SignupComplete, db: Session = Depends(get_db)):
    verification_entry = crud.get_signup_verification(db, email=completion_data.email)
    if not verification_entry:
        raise HTTPException(status_code=404, detail="Verification data not found. Please start over.")
    new_user = crud.create_user_from_verification(db, verification_entry)
    crud.add_user_interests(db, user_id=new_user.id, interest_names=completion_data.interests)
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=login_data.email)
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    
    # Manually build the user response for Pydantic v2 compatibility
    user_response = schemas.UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        interests=[interest.name for interest in user.interests],
        created_at=user.created_at
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

# --- POSTS & COMMENTS ROUTES ---

@app.post("/posts/", response_model=schemas.PostResponse)
async def create_new_post(
    post: schemas.PostCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    return await crud.create_post(db=db, post=post, author_id=current_user.id)

@app.get("/posts/", response_model=List[schemas.PostResponse])
def read_posts(skip: int = 0, limit: int = 25, db: Session = Depends(get_db)):
    posts = crud.get_posts(db, skip=skip, limit=limit)
    return posts

@app.get("/posts/{post_id}", response_model=schemas.PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@app.post("/posts/{post_id}/comments/", response_model=schemas.CommentResponse)
async def create_new_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return await crud.create_comment(
        db=db, comment=comment, post_id=post_id,
        author_id=current_user.id, parent_comment_id=parent_id
    )

# --- NEW: Community Routes ---
@app.post("/communities/", response_model=schemas.CommunityResponse)
def create_new_community(
    community: schemas.CommunityCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    db_community = crud.get_community_by_name(db, name=community.name)
    if db_community:
        raise HTTPException(status_code=400, detail="Community with this name already exists")
    return crud.create_community(db=db, community=community, creator_id=current_user.id)

@app.get("/communities/", response_model=List[schemas.CommunityResponse])
def read_communities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    communities = crud.get_communities(db, skip=skip, limit=limit)
    return communities

@app.get("/communities/{community_id}/posts", response_model=List[schemas.PostResponse])
def read_posts_from_community(community_id: int, skip: int = 0, limit: int = 25, db: Session = Depends(get_db)):
    posts = crud.get_posts_by_community(db, community_id=community_id, skip=skip, limit=limit)
    return posts

# --- ML Service Integration & Health Check ---
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ML Service Integration Endpoints
@app.get("/ml/health")
async def ml_health_check():
    """Check ML service health"""
    is_healthy = await ml_client.health_check()
    if is_healthy:
        return {"status": "ML service is healthy"}
    else:
        raise HTTPException(status_code=503, detail="ML service is unavailable")

@app.post("/ml/analyze", response_model=schemas.MLAnalysisResponse)
async def analyze_text(request: schemas.MLAnalysisRequest):
    """Analyze text for toxicity/sentiment using ML service"""
    result = await ml_client.analyze_text(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML analysis service unavailable")
    return result

@app.post("/ml/summarize", response_model=schemas.MLSummaryResponse)
async def summarize_text(request: schemas.MLSummaryRequest):
    """Summarize text using ML service"""
    result = await ml_client.summarize_text(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML summarization service unavailable")
    return result

@app.post("/ml/embed", response_model=schemas.MLEmbeddingResponse)
async def create_embedding(request: schemas.MLEmbeddingRequest):
    """Create and store text embedding using ML service"""
    result = await ml_client.create_embedding(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML embedding service unavailable")
    return result

@app.post("/ml/search", response_model=schemas.MLSearchResponse)
async def search_similar_content(request: schemas.MLSearchRequest):
    """Search for similar content using ML service"""
    result = await ml_client.search_similar(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML search service unavailable")
    return result

@app.post("/ml/emotions", response_model=schemas.MLEmotionResponse)
async def analyze_emotions(request: schemas.MLEmotionRequest):
    """Analyze emotions in text using ML service"""
    result = await ml_client.analyze_emotions(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML emotion analysis service unavailable")
    return result

@app.post("/ml/post-emotions", response_model=schemas.MLPostEmotionResponse)
async def analyze_post_emotions(request: schemas.MLPostEmotionRequest):
    """Analyze emotions of a single post using ML service"""
    result = await ml_client.analyze_post_emotions(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML post emotion analysis service unavailable")
    return result

@app.post("/ml/discussion-emotions", response_model=schemas.MLDiscussionEmotionResponse)
async def analyze_discussion_emotions(request: schemas.MLDiscussionEmotionRequest):
    """Analyze emotions of entire discussion using ML service"""
    result = await ml_client.analyze_discussion_emotions(request)
    if result is None:
        raise HTTPException(status_code=503, detail="ML discussion emotion analysis service unavailable")
    return result

@app.get("/posts/{post_id}/emotions", response_model=schemas.MLDiscussionEmotionResponse)
async def get_post_emotion_analysis(post_id: int, db: Session = Depends(get_db)):
    """Get detailed emotion analysis for a post and its discussion"""
    result = await crud.get_discussion_emotion_analysis(db, post_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Post not found or emotion analysis failed")
    return result

@app.put("/posts/{post_id}/update-emotions")
async def update_post_emotions(post_id: int, db: Session = Depends(get_db)):
    """Manually trigger emotion analysis update for a post"""
    try:
        await crud.update_discussion_emotions(db, post_id)
        return {"message": f"Emotion analysis updated for post {post_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update emotions: {str(e)}")

# --- SEMANTIC SEARCH ENDPOINTS (for Search Tab) ---

@app.post("/search/semantic", response_model=dict)
async def semantic_search_endpoint(
    query: str,
    limit: int = 10,
    threshold: float = 0.7,
    db: Session = Depends(get_db)
):
    """Semantic search for posts - used in search tab"""
    try:
        result = await crud.semantic_search_posts(db, query, limit, threshold)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic search failed: {str(e)}")

@app.get("/search/recommendations/{post_id}")
async def get_post_recommendations(
    post_id: int,
    limit: int = 5,
    threshold: float = 0.6,
    db: Session = Depends(get_db)
):
    """Get recommended posts based on a specific post's content"""
    try:
        # Get the source post
        source_post = crud.get_post(db, post_id)
        if not source_post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Use the post content as query for semantic search
        query = f"{source_post.title} {source_post.content}"
        result = await crud.semantic_search_posts(db, query, limit + 1, threshold)  # +1 to exclude self
        
        # Remove the source post from results
        filtered_results = [
            r for r in result["results"] 
            if r["post"].id != post_id
        ][:limit]
        
        return {
            "source_post_id": post_id,
            "recommendations": filtered_results,
            "total_recommendations": len(filtered_results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.post("/admin/process-existing-posts")
async def process_existing_posts_for_search(db: Session = Depends(get_db)):
    """Process existing posts to add them to semantic search index"""
    try:
        # Get all posts that don't have embeddings yet
        posts = crud.get_posts(db, skip=0, limit=1000)  # Process in batches
        processed = 0
        failed = 0
        
        for post in posts:
            try:
                # Store embedding for semantic search
                full_content = f"{post.title} {post.content}"
                embedding_request = schemas.MLEmbeddingRequest(
                    content_id=str(post.id),
                    text=full_content
                )
                result = await ml_client.store_post_embedding(embedding_request)
                if result:
                    processed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"Failed to process post {post.id}: {e}")
                failed += 1
        
        return {
            "message": f"Processed {processed} posts successfully, {failed} failed",
            "processed": processed,
            "failed": failed,
            "total": len(posts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process existing posts: {str(e)}")