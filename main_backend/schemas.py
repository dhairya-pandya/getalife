from pydantic import BaseModel
from typing import List, Optional

# NEW FIELD `interests`
class UserCreate(BaseModel):
    username: str
    password: str
    interests: List[str] = [] # Frontend will send a list of strings

class User(BaseModel):
    id: int
    username: str
    interests: List[str] = []
    
    class Config:
        orm_mode = True