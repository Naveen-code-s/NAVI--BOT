# Navi Bot

Navi is a personal AI assistant starter with conversational context, saved memories, a personal knowledge library, research mode, voice input/output, and a task manager. The interface uses responsive glassmorphism styling. This first version stores data in local JSON files and keeps the OpenAI key on the backend.

## Project structure

- `backend/` — FastAPI API, assistant agents, OpenAI integration, and local JSON storage.
- `frontend/` — Vite + React glass UI.

## Run it on Windows

1. In `backend/`, copy `.env.example` to `.env` and add your key to `OPENAI_API_KEY`.
2. Open PowerShell in `backend/` and run:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. Open a second PowerShell window in `frontend/` and run:

   ```powershell
   npm install
   npm run dev
   ```

4. Visit `http://localhost:5173`.

## Current scope

- Chat uses the configured OpenAI model, the latest conversation turns, and keyword-matched saved memories.
- Research mode asks the model for a careful answer, but live web retrieval and source citations are not connected yet.
- Voice uses browser speech recognition and speech synthesis, which depend on browser support.
- Tasks and memories persist in `backend/database/*.json` on this machine. Keep the API local; this starter has no authentication or multi-user access controls.
- `services/vector_service.py` is a simple keyword search placeholder, not an embeddings database.
