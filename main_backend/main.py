
import random
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- ADD THIS IMPORT
from sqlalchemy.orm import Session
import crud, models, schemas, auth
from database import SessionLocal, engine


# This line creates your database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# --- CREATE THE APP INSTANCE HERE ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

## --- AUTHENTICATION ROUTES --- ##

@app.post("/signup/start", status_code=200)
def signup_start(user_data: schemas.SignupStart, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, email=user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, username=user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    otp = str(random.randint(100000, 999999))
    print(f"Generated OTP for {user_data.email}: {otp}") # For testing

    password_hash = auth.get_password_hash(user_data.password)
    otp_hash = auth.get_password_hash(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Use a CRUD function to create/update the verification entry
    crud.create_or_update_signup_verification(
        db, 
        email=user_data.email, 
        username=user_data.username, 
        password_hash=password_hash, 
        otp_hash=otp_hash, 
        expires_at=expires_at
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
        crud.increment_failed_attempts(db, email=otp_data.email)
        if verification_entry.failed_attempts + 1 >= 5:
             crud.delete_signup_verification(db, email=otp_data.email)
             raise HTTPException(status_code=401, detail="Too many failed attempts. Please sign up again.")
        raise HTTPException(status_code=401, detail="Invalid OTP.")

    return {"message": "OTP verified successfully. Please select your interests."}

@app.post("/signup/complete", response_model=schemas.UserResponse, status_code=201)
def signup_complete(completion_data: schemas.SignupComplete, db: Session = Depends(get_db)):
    verification_entry = crud.get_signup_verification(db, email=completion_data.email)
    if not verification_entry:
        raise HTTPException(status_code=404, detail="Verification data not found. Please start over.")

    # Create the user using the temporary data
    new_user = crud.create_user_from_verification(db, verification_entry)
    
    # Add interests
    crud.add_user_interests(db, user_id=new_user.id, interest_names=completion_data.interests)
    
    # Clean up
    crud.delete_signup_verification(db, email=completion_data.email)
    
    # We need to refresh the user object to load the new interests relationship
    db.refresh(new_user)
    
    # Manually create the response to include interests
    user_response = schemas.UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        interests=[interest.name for interest in new_user.interests],
        created_at=new_user.created_at
    )
    return user_response