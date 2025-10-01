# Kryptonite AI Chatbot ⚡

Welcome to Kryptonite, a fully-featured, voice-enabled, full-stack AI chatbot with a funky Gen Z personality. This project features a secure Python/Flask backend and a sleek, modern frontend.

**Live Frontend (Vercel):** [https://kryptonite-bot.vercel.app/](https://kryptonite-bot.vercel.app/)
**Live Backend (Render):** [https://kryptonite-backend.onrender.com/](https://kryptonite-backend.onrender.com/)

![Kryptonite Chatbot Demo](https://placehold.co/800x400/1D1C2D/A78BFA?text=Kryptonite)

---

## Features

-   **😎 Funky Gen Z Personality:** Kryptonite talks your language, with modern slang and a cool, sassy vibe.
-   **🎤 Voice Input & Output:** Use the mic to talk to Kryptonite and hear its responses spoken back to you (on supported browsers).
-   **🌓 Light & Dark Mode:** A sleek, aesthetic UI with a theme switcher that saves your preference in local storage.
-   **📚 Persistent Chat History:** Conversations are saved! Revisit, clear, or start new chats from the slide-out history panel.
-   **🔐 Secure Full-Stack Architecture:** The frontend (Vercel) and backend (Render) are decoupled. The Google Gemini API key is kept 100% secret on the backend server.
-   **📱 Fully Responsive:** The UI is optimized for a seamless experience on both desktop and mobile devices.

---

## Tech Stack

-   **Frontend (Deployed on Vercel):**
    -   HTML5
    -   CSS3 (with utility classes from Tailwind CSS)
    -   Vanilla JavaScript
    -   Web Speech API (for voice features)
    -   highlight.js (for code syntax highlighting)

-   **Backend (Deployed on Render):**
    -   Python
    -   Flask (for the web server and API)
    -   Gunicorn (as the production web server)
    -   Requests (to communicate with the Google API)
    -   Flask-CORS (to securely connect the frontend and backend)

-   **AI:**
    -   Google Gemini API

---

## Project Structure

This project is structured as a monorepo, with the frontend and backend in separate directories.

```
/
├── frontend/
│   ├── index.html         # Main HTML structure
│   ├── style.css          # All custom styles for the UI
│   └── script.js          # Core application logic and API calls
├── backend/
│   ├── app.py             # The Python Flask backend server
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Example for environment variables
└── .gitignore             # To protect secret keys and environment folders

```

---

## Setup and Deployment Guide

To deploy this project, you will need accounts on GitHub, Vercel, and Render.

### 1. Get a Google Gemini API Key

You'll need a free API key from Google to power the chatbot.
1.  Go to **[Google AI Studio](https://aistudio.google.com/)**.
2.  Sign in and click **"Get API key"**.
3.  Click **"Create API key in new project"** and copy the generated key.

### 2. Deploy the Backend to Render

1.  **Push to GitHub:** Ensure your entire project is in a single GitHub repository.
2.  **Create a New Web Service on Render:**
    -   Go to your Render dashboard, click **New +** > **Web Service**, and connect your GitHub repository.
3.  **Configure the Settings:**
    -   **Name:** `kryptonite-backend` (or any unique name).
    -   **Root Directory:** `backend` (This tells Render to only look inside this folder).
    -   **Build Command:** `pip install -r requirements.txt`
    -   **Start Command:** `gunicorn app:app`
    -   **Instance Type:** Select the **Free** tier.
4.  **Add Environment Variables:**
    -   Go to the **Environment** tab.
    -   Add the following two secrets:
        1.  **Key:** `GEMINI_API_KEY`
            **Value:** *Paste your secret Google Gemini API key here.*
        2.  **Key:** `VERCEL_FRONTEND_URL`
            **Value:** *The full URL of your Vercel frontend (e.g., `https://kryptonite-bot.vercel.app`)*.
5.  **Deploy:** Click **Create Web Service**. Once deployed, copy the public URL Render provides.

### 3. Deploy the Frontend to Vercel

1.  **Update the Backend URL:**
    -   In your local `frontend/script.js` file, find the `apiUrl` variable.
    -   Replace the placeholder with the public URL you copied from Render:
        ```javascript
        const apiUrl = '[https://your-render-backend-name.onrender.com/api/chat](https://your-render-backend-name.onrender.com/api/chat)';
        ```
2.  **Push the Change:** Commit and push this update to your GitHub repository.
3.  **Create a New Project on Vercel:**
    -   Go to your Vercel dashboard, click **Add New...** > **Project**, and import the same GitHub repository.
4.  **Configure the Settings:**
    -   In the project settings, find the **Root Directory** option.
    -   Set it to **`frontend`**.
5.  **Deploy:** Click **Deploy**. Vercel will build and deploy your frontend.

Your Kryptonite chatbot is now live with a secure, full-stack architecture!

---

## Created By

This project was created by **Aryan**.
