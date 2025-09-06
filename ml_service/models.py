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

class EmotionRequest(BaseModel):
      text: str
      threshold: float = 0.3

class EmotionResponse(BaseModel):
    emotions: List[dict]

class PostEmotionRequest(BaseModel):
    post_id: str
    post_content: str

class PostEmotionResponse(BaseModel):
    post_id: str
    dominant_emotion: str
    emotions: List[dict]
    confidence: float

class DiscussionEmotionRequest(BaseModel):
    post_id: str
    post_content: str
    comments: List[str]

class DiscussionEmotionResponse(BaseModel):
    post_id: str
    overall_dominant_emotion: str
    post_dominant_emotion: str
    post_emotions: List[dict]
    comment_emotions: List[dict]
    emotion_breakdown: dict
    confidence: float
    total_analyzed: int

class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10
    threshold: float = 0.7

class SemanticSearchResponse(BaseModel):
    query: str
    results: List[dict]  # [{"post_id": str, "similarity": float, "content": str}]
    total_results: int