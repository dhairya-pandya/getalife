import chromadb
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from ml.loader import load_models, models, infer_emotions, analyze_post_emotions, analyze_discussion_emotions
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

@app.post("/post-emotions", response_model=PostEmotionResponse)
def analyze_post_emotions_endpoint(request: PostEmotionRequest):
    try:
        dominant_emotion, emotions, confidence = analyze_post_emotions(request.post_content)
        return PostEmotionResponse(
            post_id=request.post_id,
            dominant_emotion=dominant_emotion,
            emotions=emotions,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Post emotion analysis failed: {str(e)}")

@app.post("/discussion-emotions", response_model=DiscussionEmotionResponse)
def analyze_discussion_emotions_endpoint(request: DiscussionEmotionRequest):
    try:
        result = analyze_discussion_emotions(request.post_content, request.comments)
        return DiscussionEmotionResponse(
            post_id=request.post_id,
            **result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discussion emotion analysis failed: {str(e)}")

@app.post("/semantic-search", response_model=SemanticSearchResponse)
def semantic_search_posts(request: SemanticSearchRequest):
    try:
        # Create embedding for the query
        query_embedding = models['embedder'].encode(request.query).tolist()
        
        # Search in ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding], 
            n_results=request.limit,
            include=['metadatas', 'distances', 'documents']
        )
        
        # Format results
        search_results = []
        if results['ids'] and results['ids'][0]:
            for i, post_id in enumerate(results['ids'][0]):
                # Calculate similarity (ChromaDB returns distances, convert to similarity)
                distance = results['distances'][0][i] if results['distances'] else 1.0
                similarity = max(0, 1 - distance)  # Convert distance to similarity
                
                # Only include results above threshold
                if similarity >= request.threshold:
                    metadata = results['metadatas'][0][i] if results['metadatas'] else {}
                    document = results['documents'][0][i] if results['documents'] else ""
                    
                    search_results.append({
                        "post_id": post_id,
                        "similarity": round(similarity, 3),
                        "content": document,
                        "metadata": metadata
                    })
        
        return SemanticSearchResponse(
            query=request.query,
            results=search_results,
            total_results=len(search_results)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic search failed: {str(e)}")

@app.post("/store-post-embedding", response_model=EmbeddingResponse)
def store_post_embedding(request: EmbeddingRequest):
    """Enhanced version that stores posts with their content for search"""
    try:
        embedding = models['embedder'].encode(request.text).tolist()
        
        # Store with document content for retrieval
        collection.add(
            embeddings=[embedding], 
            metadatas=[{"content_id": request.content_id, "type": "post"}], 
            documents=[request.text],
            ids=[request.content_id]
        )
        return EmbeddingResponse(status="success", content_id=request.content_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store post embedding: {str(e)}")