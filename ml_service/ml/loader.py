import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import tensorflow as tf
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import json
import re

models = {}

EMOTION_LABELS = [
    'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 
    'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval', 
    'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief', 
    'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization', 
    'relief', 'remorse', 'sadness', 'surprise'
]
MAX_LEN = 100

def load_models():

    print("Loading standard Hugging Face models.")
    device = -1  # As CUDA is not available
    models['classifier'] = pipeline("text-classification", model="unitary/toxic-bert", device=device)
    models['summarizer'] = pipeline("summarization", model="facebook/bart-large-cnn", device=device)
    models['embedder'] = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
    print("Standard models loaded.")

    print("\nLoading custom GoEmotions model.")
    try:

        emotion_model = tf.keras.models.load_model('goemotions_lstm_model_v2.keras')
        
        with open('tokenizer_v2.json') as f:
            data = json.load(f)
            emotion_tokenizer = tokenizer_from_json(data)
            
        models['emotion_classifier'] = {
            "model": emotion_model,
            "tokenizer": emotion_tokenizer,
            "labels": EMOTION_LABELS,
            "max_len": MAX_LEN
        }
        print("Model and Tokenizer Succecssffully!")
        
    except Exception as e:
        print(f"ERROR: Could not load custom emotion model. Please check file paths.")
        print(f"Error details: {e}")
        models['emotion_classifier'] = None


def clean_text(text):
    text = text.lower()
    text = re.sub(r'\[name\]', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def infer_emotions(text, threshold=0.3):

    if not models.get('emotion_classifier'):
        return [{"error": "Emotion classifier model is not loaded."}]

    model_assets = models['emotion_classifier']
    model = model_assets['model']
    tokenizer = model_assets['tokenizer']
    labels = model_assets['labels']
    max_len = model_assets['max_len']

    cleaned_text = clean_text(text)
    sequence = tokenizer.texts_to_sequences([cleaned_text])
    padded_sequence = pad_sequences(sequence, maxlen=max_len, padding='post', truncating='post')
    
    predictions = model.predict(padded_sequence, verbose=0)[0]
    
    predicted_emotions = []
    for i, prob in enumerate(predictions):
        if prob > threshold:
            predicted_emotions.append({
                "emotion": labels[i],
                "probability": f"{prob:.2f}"
            })
            
    predicted_emotions.sort(key=lambda x: float(x["probability"]), reverse=True)
    
    if not predicted_emotions:
        return [{"emotion": "neutral", "probability": "1.00"}]
        
    return predicted_emotions

if __name__ == '__main__':

    load_models()
