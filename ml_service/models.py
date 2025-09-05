from pydantic import BaseModel
from typing import List

class AnalysisRequest(BaseModel):
      text:str

class AnalysisResponse(BaseModel):
      label:str;
      score:float

class SummaryRequest(BaseModel):
      text:str;
      max_length: int=1500;
      min_length: int=10

class SummaryResponse(BaseModel):
      summary:str

class EmbeddingRequest(BaseModel):
      content_id: str
      text: str


class EmbeddingResponse(BaseModel):
      status: str
      content_id: str

class SearchRequest(BaseModel):
      query:str;
      top_k:int=7

class SearchResponse(BaseModel):
      content_ids:List[str]