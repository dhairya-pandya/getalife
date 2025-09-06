import chromadb
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from ml.loader import load_models, models, infer_emotions
from models import * 

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="posts_and_comments")

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield
    models.clear()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def read_root(): return {"status": "ML service is running"}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_text(request: AnalysisRequest):
    result = models['classifier'](request.text)[0]
    return AnalysisResponse(**result)

@app.post("/summarize", response_model=SummaryResponse)
def summarize_text(request: SummaryRequest):
    summary = models['summarizer'](request.text, max_length=request.max_length, min_length=request.min_length, do_sample=False)[0]['summary_text']
    return SummaryResponse(summary=summary)

@app.post("/embed-and-store", response_model=EmbeddingResponse)
def create_embedding(request: EmbeddingRequest):
    embedding = models['embedder'].encode(request.text).tolist()
    collection.add(embeddings=[embedding], metadatas=[{"content_id": request.content_id}], ids=[request.content_id])
    return EmbeddingResponse(status="success", content_id=request.content_id)

@app.post("/search", response_model=SearchResponse)
def search_similar(request: SearchRequest):
    query_embedding = models['embedder'].encode(request.query).tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=request.top_k)
    content_ids = [item['content_id'] for item in results['metadatas'][0]]
    return SearchResponse(content_ids=content_ids)

@app.post("/emotions", response_model=EmotionResponse)
def analyze_emotions(request: EmotionRequest):
    try:
        emotions = infer_emotions(request.text, request.threshold)
        return EmotionResponse(emotions=emotions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emotion analysis failed: {str(e)}")