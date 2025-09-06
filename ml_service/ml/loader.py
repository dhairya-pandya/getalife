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

def get_dominant_emotion(emotions):
    """Get the dominant emotion and its confidence"""
    if not emotions or emotions[0].get("error"):
        return "neutral", 0.0
    
    # Return the emotion with highest probability
    if emotions:
        top_emotion = emotions[0]
        return top_emotion.get('emotion', 'neutral'), float(top_emotion.get('probability', 0.0))

def analyze_post_emotions(post_content, threshold=0.3):
    """Analyze emotions of a single post"""
    emotions = infer_emotions(post_content, threshold)
    dominant_emotion, confidence = get_dominant_emotion(emotions)
    return dominant_emotion, emotions, confidence

def analyze_discussion_emotions(post_content, comments, threshold=0.3):
    """Analyze emotions of entire discussion (post + comments)"""
    # Analyze post
    post_emotions = infer_emotions(post_content, threshold)
    post_dominant, post_confidence = get_dominant_emotion(post_emotions)
    
    # Analyze comments
    all_comment_emotions = []
    comment_dominants = []
    
    for comment in comments:
        if comment.strip():  # Skip empty comments
            comment_emotions = infer_emotions(comment, threshold)
            all_comment_emotions.extend(comment_emotions)
            comment_dominant, _ = get_dominant_emotion(comment_emotions)
            comment_dominants.append(comment_dominant)
    
    # Aggregate all emotions from post and comments
    all_emotions = post_emotions + all_comment_emotions
    
    # Create emotion breakdown with average probabilities
    emotion_breakdown = {}
    for emotion in all_emotions:
        emotion_name = emotion.get('emotion', '')
        if emotion_name:
            if emotion_name not in emotion_breakdown:
                emotion_breakdown[emotion_name] = []
            emotion_breakdown[emotion_name].append(float(emotion.get('probability', 0)))
    
    # Average the emotion probabilities
    for emotion_name in emotion_breakdown:
        emotion_breakdown[emotion_name] = round(
            sum(emotion_breakdown[emotion_name]) / len(emotion_breakdown[emotion_name]), 2
        )
    
    # Find overall dominant emotion
    if emotion_breakdown:
        overall_dominant = max(emotion_breakdown, key=emotion_breakdown.get)
        overall_confidence = emotion_breakdown[overall_dominant]
    else:
        overall_dominant = "neutral"
        overall_confidence = 0.0
    
    return {
        'overall_dominant_emotion': overall_dominant,
        'post_dominant_emotion': post_dominant,
        'post_emotions': post_emotions,
        'comment_emotions': all_comment_emotions,
        'emotion_breakdown': emotion_breakdown,
        'confidence': round(overall_confidence, 2),
        'total_analyzed': 1 + len(comments)  # post + comments
    }

if __name__ == '__main__':

    load_models()
