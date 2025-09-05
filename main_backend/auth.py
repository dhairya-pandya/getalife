# app.py (Updated for 3-Step Signup)

import os
import psycopg2
import psycopg2.extras
import bcrypt
import random
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()
app = Flask(__name__)
CORS(app)

def get_db_connection():
    # ... (this function is unchanged) ...
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    return conn

def send_otp_email(to_email, otp):
    # ... (this function is unchanged) ...
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_PASSWORD")
    if not sender_email or not sender_password:
        print("ERROR: Email credentials are not set.")
        return False
    message = MIMEMultipart("alternative")
    message["Subject"] = "Your App Verification Code"
    message["From"] = sender_email
    message["To"] = to_email
    html = f"""<html><body><h3>Your Verification Code</h3><p>Your OTP is:</p><h1 style="font-size: 2em; letter-spacing: 5px;">{otp}</h1><p>This code will expire in 10 minutes.</p></body></html>"""
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

## SIGN-UP STEP 1: INITIATE & SEND OTP ##
@app.route('/signup/start', methods=['POST'])
def signup_start():
    # ... (this endpoint is unchanged) ...
    data = request.get_json()
    username, email, password = data.get('username'), data.get('email'), data.get('password')
    if not all([username, email, password]):
        return jsonify({"error": "Missing required fields"}), 400
    otp = str(random.randint(100000, 999999))
    print(f"Generated OTP for {email}: {otp}")
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    otp_hash = bcrypt.hashpw(otp.encode('utf-8'), bcrypt.gensalt())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO signup_verifications (email, username, password_hash, otp_hash, expires_at, failed_attempts)
            VALUES (%s, %s, %s, %s, %s, 0)
            ON CONFLICT (email) DO UPDATE SET
                username = EXCLUDED.username, password_hash = EXCLUDED.password_hash,
                otp_hash = EXCLUDED.otp_hash, expires_at = EXCLUDED.expires_at, failed_attempts = 0;
        """, (email, username, password_hash.decode('utf-8'), otp_hash.decode('utf-8'), expires_at))
        conn.commit()
        cur.close()
        email_sent = send_otp_email(email, otp)
        if not email_sent:
            return jsonify({"error": "Failed to send OTP email."}), 500
        return jsonify({"message": "OTP has been sent to your email."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

## SIGN-UP STEP 2: VERIFY OTP ##
@app.route('/signup/verify-otp', methods=['POST'])
def signup_verify_otp():
    MAX_FAILED_ATTEMPTS = 5
    data = request.get_json()
    email, otp = data.get('email'), data.get('otp')
    if not all([email, otp]):
        return jsonify({"error": "Email and OTP are required"}), 400
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM signup_verifications WHERE email = %s", (email,))
        verification_data = cur.fetchone()
        if not verification_data:
            return jsonify({"error": "Invalid email or verification process not started"}), 404
        if verification_data['expires_at'] < datetime.now(timezone.utc):
            cur.execute("DELETE FROM signup_verifications WHERE email = %s", (email,))
            conn.commit()
            return jsonify({"error": "OTP has expired. Please sign up again."}), 400
        if not bcrypt.checkpw(otp.encode('utf-8'), verification_data['otp_hash'].encode('utf-8')):
            current_attempts = verification_data['failed_attempts'] + 1
            if current_attempts >= MAX_FAILED_ATTEMPTS:
                cur.execute("DELETE FROM signup_verifications WHERE email = %s", (email,))
                conn.commit()
                return jsonify({"error": "Too many failed attempts. Please sign up again."}), 401
            else:
                cur.execute("UPDATE signup_verifications SET failed_attempts = %s WHERE email = %s", (current_attempts, email))
                conn.commit()
                remaining = MAX_FAILED_ATTEMPTS - current_attempts
                return jsonify({"error": f"Invalid OTP. You have {remaining} attempts remaining."}), 401
        # OTP is correct, but don't delete the entry yet. Just confirm.
        return jsonify({"message": "OTP verified successfully. Please select your interests."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

## SIGN-UP STEP 3: COMPLETE REGISTRATION ##
@app.route('/signup/complete', methods=['POST'])
def signup_complete():
    data = request.get_json()
    email, interests = data.get('email'), data.get('interests', [])
    if not all([email, interests]):
        return jsonify({"error": "Email and interests are required"}), 400
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM signup_verifications WHERE email = %s", (email,))
        verification_data = cur.fetchone()
        if not verification_data:
            return jsonify({"error": "Verification data not found. Please start over."}), 404
        
        # --- Start Transaction ---
        try:
            cur.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (verification_data['username'], email, verification_data['password_hash'])
            )
            user_id = cur.fetchone()['id']
            for interest_name in interests:
                cur.execute("INSERT INTO interests (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id", (interest_name.lower(),))
                interest_id = cur.fetchone()['id']
                cur.execute("INSERT INTO user_interests (user_id, interest_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, interest_id))
            cur.execute("DELETE FROM signup_verifications WHERE email = %s", (email,))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": f"Database transaction failed: {e}"}), 500
        # --- End Transaction ---

        cur.close()
        return jsonify({"message": "User account created successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

## LOGIN ENDPOINT ##
@app.route('/login', methods=['POST'])
def login():
    # ... (this endpoint is unchanged) ...
    data = request.get_json()
    email, password = data.get('email'), data.get('password')
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"message": "Login successful!", "user": {"id": user['id'], "username": user['username']}}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

if __name__ == '__main__':
    app.run(debug=True)