import httpx
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import crud, models, schemas, auth
from database import SessionLocal, engine

ML_SERVICE_URL = "http://ml_service:8000"
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()
