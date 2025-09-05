import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer

modelss={}


def load_models():
    device=-1 #  As CUDA is not available
    modelss['classifier']=pipeline("text-classification",model="unitary/toxic-bert",device=device)
    modelss['summarizer']=pipeline("summarization",model="facebook/bart-large-cnn",device=device)
    modelss['embedder']=SentenceTransformer("all-MiniLM-L6-v2",device="cpu")
