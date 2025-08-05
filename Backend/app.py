import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# --- CORS Configuration ---
# This more explicit configuration is better for production.
VERCEL_FRONTEND_URL = os.getenv("VERCEL_FRONTEND_URL")
print(f"CORS is configured to allow requests from: {VERCEL_FRONTEND_URL}")

# Apply CORS settings to the app
CORS(app, resources={r"/api/*": {"origins": VERCEL_FRONTEND_URL}})


@app.route('/api/chat', methods=['POST'])
@cross_origin() # Add this decorator for extra certainty
def chat():
    print("--- POST request received at /api/chat ---")
    try:
        data = request.get_json()
        if not data:
            print("ERROR: Request body was empty or not valid JSON.")
            return jsonify({"error": {"message": "Request body was empty or not valid JSON."}}), 400
        
        print("Received data successfully.")

        contents = data.get('contents')
        system_instruction = data.get('system_instruction')
        api_key = os.getenv('GEMINI_API_KEY')

        if not api_key:
            print("ERROR: GEMINI_API_KEY secret is not configured on Render.")
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
        
        print("Sending request to Google Gemini API...")
        response = requests.post(gemini_api_url, json=payload)
        response.raise_for_status() 
        print("Successfully received response from Google.")

        return jsonify(response.json())

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP ERROR from Google API: {http_err.response.text}")
        return jsonify(http_err.response.json()), http_err.response.status_code
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": {"message": str(e)}}), 500

@app.route('/')
def home():
    return "Kryptonite Backend is running! ⚡"

