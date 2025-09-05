import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer

models = {}

def load_models():
    device = -1  # As CUDA is not available
    models['classifier'] = pipeline("text-classification", model="unitary/toxic-bert", device=device)
    models['summarizer'] = pipeline("summarization", model="facebook/bart-large-cnn", device=device)
    models['embedder'] = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
