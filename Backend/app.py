import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from a .env file (for local development)
load_dotenv()

# Initialize the Flask application
app = Flask(__name__)

# --- Configure CORS ---
# Get the frontend URL from an environment variable for flexibility.
# Fallback to a default for local testing if not set.
VERCEL_FRONTEND_URL = os.getenv("VERCEL_FRONTEND_URL", "http://127.0.0.1:5500")

# This is the crucial part for connecting the two services.
# It tells the backend that it's okay to accept requests from your Vercel URL.
CORS(app, resources={r"/api/*": {"origins": VERCEL_FRONTEND_URL}})

# --- API Route for the Chatbot ---
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        contents = data.get('contents')
        system_instruction = data.get('system_instruction')

        # Get the secret API key from environment variables/secrets
        api_key = os.getenv('GEMINI_API_KEY')

        if not api_key:
            return jsonify({"error": {"message": "GEMINI_API_KEY is not configured on the server."}}), 500

        gemini_api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}'

        payload = {
            "contents": contents,
            "system_instruction": system_instruction,
            "generationConfig": { "temperature": 0.8, "topK": 1, "topP": 1, "maxOutputTokens": 8192 },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ],
        }

        response = requests.post(gemini_api_url, json=payload)
        response.raise_for_status() 

        return jsonify(response.json())

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return jsonify(http_err.response.json()), http_err.response.status_code
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": {"message": str(e)}}), 500

# A simple root route to confirm the backend is running
@app.route('/')
def home():
    return "Kryptonite Backend is running! ⚡"

# Note: The __main__ block is not needed for Hugging Face deployment,
# but it's useful for local testing.
if __name__ == '__main__':
    app.run(port=7860) # Hugging Face Spaces typically use port 7860
