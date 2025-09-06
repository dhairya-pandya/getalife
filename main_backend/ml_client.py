import httpx
import os
from typing import Optional
import schemas

class MLServiceClient:
    def __init__(self):
        self.base_url = os.getenv("ML_SERVICE_URL", "http://ml_service:8000")
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def health_check(self) -> bool:
        """Check if ML service is healthy"""
        try:
            response = await self.client.get(f"{self.base_url}/health")
            return response.status_code == 200
        except Exception as e:
            print(f"ML service health check failed: {e}")
            return False
    
    async def analyze_text(self, request: schemas.MLAnalysisRequest) -> Optional[schemas.MLAnalysisResponse]:
        """Analyze text for toxicity/sentiment"""
        try:
            response = await self.client.post(
                f"{self.base_url}/analyze",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLAnalysisResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML analysis failed: {e}")
            return None
    
    async def summarize_text(self, request: schemas.MLSummaryRequest) -> Optional[schemas.MLSummaryResponse]:
        """Summarize text"""
        try:
            response = await self.client.post(
                f"{self.base_url}/summarize",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLSummaryResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML summarization failed: {e}")
            return None
    
    async def create_embedding(self, request: schemas.MLEmbeddingRequest) -> Optional[schemas.MLEmbeddingResponse]:
        """Create and store text embedding"""
        try:
            response = await self.client.post(
                f"{self.base_url}/embed-and-store",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLEmbeddingResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML embedding creation failed: {e}")
            return None
    
    async def search_similar(self, request: schemas.MLSearchRequest) -> Optional[schemas.MLSearchResponse]:
        """Search for similar content"""
        try:
            response = await self.client.post(
                f"{self.base_url}/search",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLSearchResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML search failed: {e}")
            return None
    
    async def analyze_emotions(self, request: schemas.MLEmotionRequest) -> Optional[schemas.MLEmotionResponse]:
        """Analyze emotions in text"""
        try:
            response = await self.client.post(
                f"{self.base_url}/emotions",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLEmotionResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML emotion analysis failed: {e}")
            return None
    
    async def analyze_post_emotions(self, request: schemas.MLPostEmotionRequest) -> Optional[schemas.MLPostEmotionResponse]:
        """Analyze emotions of a single post"""
        try:
            response = await self.client.post(
                f"{self.base_url}/post-emotions",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLPostEmotionResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML post emotion analysis failed: {e}")
            return None
    
    async def analyze_discussion_emotions(self, request: schemas.MLDiscussionEmotionRequest) -> Optional[schemas.MLDiscussionEmotionResponse]:
        """Analyze emotions of entire discussion (post + comments)"""
        try:
            response = await self.client.post(
                f"{self.base_url}/discussion-emotions",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLDiscussionEmotionResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML discussion emotion analysis failed: {e}")
            return None

    async def semantic_search(self, request: schemas.MLSemanticSearchRequest) -> Optional[schemas.MLSemanticSearchResponse]:
        """Perform semantic search on posts"""
        try:
            response = await self.client.post(
                f"{self.base_url}/semantic-search",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLSemanticSearchResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML semantic search failed: {e}")
            return None

    async def store_post_embedding(self, request: schemas.MLEmbeddingRequest) -> Optional[schemas.MLEmbeddingResponse]:
        """Store post embedding for semantic search"""
        try:
            response = await self.client.post(
                f"{self.base_url}/store-post-embedding",
                json=request.dict()
            )
            if response.status_code == 200:
                return schemas.MLEmbeddingResponse(**response.json())
            return None
        except Exception as e:
            print(f"ML post embedding storage failed: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global ML service client instance
ml_client = MLServiceClient()
