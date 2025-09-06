# main_backend/auth.py (Simplified without JWT)
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "a_default_secret_key_if_not_set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Token valid for 24 hours

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Password Hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a plain password."""
    return pwd_context.hash(password)

# Email Sending
def send_otp_email(to_email: str, otp: str):
    """Sends an OTP to the specified email address."""
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("ERROR: Email credentials are not set in environment variables.")
        return False
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "Your Verification Code"
    message["From"] = sender_email
    message["To"] = to_email
    html = f"""<html><body><h3>Your Verification Code</h3><p>Your one-time password (OTP) is: <strong>{otp}</strong></p><p>This code will expire in 10 minutes.</p></body></html>"""
    message.attach(MIMEText(html, "html"))
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
        print(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False