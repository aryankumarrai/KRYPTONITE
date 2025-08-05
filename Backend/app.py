import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# --- CORS Configuration ---
# This is a more robust way to handle CORS.
# It explicitly allows the necessary headers and methods.
VERCEL_FRONTEND_URL = os.getenv("VERCEL_FRONTEND_URL", "http://127.0.0.1:5500")
CORS(app, resources={r"/api/*": {
    "origins": VERCEL_FRONTEND_URL,
    "methods": ["POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})
print(f"CORS configured for origin: {VERCEL_FRONTEND_URL}")

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    # The browser sends an OPTIONS request first to check CORS.
    # We need to handle it and send back an OK response.
    if request.method == 'OPTIONS':
        return '', 204

    # This is the main logic for the POST request.
    try:
        print("Received a POST request to /api/chat")
        data = request.get_json()
        if not data:
            print("Request body is empty or not JSON.")
            return jsonify({"error": {"message": "Request body is empty or not JSON."}}), 400
        
        print("Request body:", data) # Log the received data

        contents = data.get('contents')
        system_instruction = data.get('system_instruction')
        api_key = os.getenv('GEMINI_API_KEY')

        if not api_key:
            return jsonify({"error": {"message": "GEMINI_API_KEY is not configured."}}), 500

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

@app.route('/')
def home():
    return "Kryptonite Backend is running! ⚡"

