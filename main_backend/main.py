import httpx
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas, auth
from database import SessionLocal, engine, get_db
from ml_client import ml_client

ML_SERVICE_URL = "http://ml_service:8000"
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GetALife API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Signup Step 1: Start signup and send OTP
@app.post("/signup/start")
async def signup_start(user_data: schemas.SignupStart, db: Session = Depends(get_db)):
    # Check if user already exists
    if crud.get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if crud.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Generate OTP and hash password
    otp = auth.generate_otp()
    password_hash = auth.get_password_hash(user_data.password)
    otp_hash = auth.hash_otp(otp)
    expires_at = auth.get_otp_expiry()
    
    # Store verification data
    verification = crud.create_signup_verification(
        db=db,
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash,
        otp_hash=otp_hash,
        expires_at=expires_at
    )
    
    # Send OTP email
    if not auth.send_otp_email(user_data.email, otp):
        raise HTTPException(status_code=500, detail="Failed to send OTP email")
    
    return {"message": "OTP has been sent to your email."}

# Signup Step 2: Verify OTP
@app.post("/signup/verify-otp")
async def verify_otp(otp_data: schemas.OTPVerify, db: Session = Depends(get_db)):
    MAX_FAILED_ATTEMPTS = 5
    
    verification = crud.get_signup_verification(db, otp_data.email)
    if not verification:
        raise HTTPException(status_code=404, detail="Invalid email or verification process not started")
    
    # Check if OTP has expired
    if auth.is_otp_expired(verification.expires_at):
        crud.delete_signup_verification(db, otp_data.email)
        raise HTTPException(status_code=400, detail="OTP has expired. Please sign up again.")
    
    # Verify OTP
    if not auth.verify_otp(otp_data.otp, verification.otp_hash):
        current_attempts = verification.failed_attempts + 1
        if current_attempts >= MAX_FAILED_ATTEMPTS:
            crud.delete_signup_verification(db, otp_data.email)
            raise HTTPException(status_code=401, detail="Too many failed attempts. Please sign up again.")
        else:
            crud.update_signup_verification_attempts(db, otp_data.email, current_attempts)
            remaining = MAX_FAILED_ATTEMPTS - current_attempts
            raise HTTPException(status_code=401, detail=f"Invalid OTP. You have {remaining} attempts remaining.")
    
    return {"message": "OTP verified successfully. Please select your interests."}

# Signup Step 3: Complete registration with interests
@app.post("/signup/complete")
async def signup_complete(complete_data: schemas.SignupComplete, db: Session = Depends(get_db)):
    verification = crud.get_signup_verification(db, complete_data.email)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification data not found. Please start over.")
    
    # Create user
    user_data = schemas.UserCreate(
        username=verification.username,
        email=complete_data.email,
        password="",  # We already have the hashed password
        interests=complete_data.interests
    )
    
    # Create user with existing password hash
    db_user = models.User(
        username=verification.username,
        email=complete_data.email,
        hashed_password=verification.password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Add interests
    if complete_data.interests:
        crud.add_user_interests(db, db_user.id, complete_data.interests)
    
    # Clean up verification data
    crud.delete_signup_verification(db, complete_data.email)
    
    return {"message": "User account created successfully!"}

# Login endpoint
@app.post("/login", response_model=schemas.LoginResponse)
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, login_data.email)
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get user interests
    interest_names = [interest.name for interest in user.interests]
    
    user_response = schemas.UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        interests=interest_names,
        created_at=user.created_at
    )
    
    return schemas.LoginResponse(
        message="Login successful!",
        user=user_response
    )

# Health check endpoint
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

# Enhanced user endpoints with ML integration
@app.get("/users/{user_id}/recommendations")
async def get_user_recommendations(user_id: int, query: str, top_k: int = 5, db: Session = Depends(get_db)):
    """Get content recommendations for a user based on their interests"""
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user interests
    interest_names = [interest.name for interest in user.interests]
    
    # Create search query combining user interests and custom query
    search_query = f"{' '.join(interest_names)} {query}"
    
    # Search for similar content using ML service
    search_request = schemas.MLSearchRequest(query=search_query, top_k=top_k)
    search_result = await ml_client.search_similar(search_request)
    
    if search_result is None:
        raise HTTPException(status_code=503, detail="Recommendation service unavailable")
    
    return {
        "user_id": user_id,
        "interests": interest_names,
        "query": query,
        "recommendations": search_result.content_ids
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
