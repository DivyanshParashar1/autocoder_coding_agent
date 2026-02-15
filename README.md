# Autocoder — Full‑Stack Agentic Coding Platform

Autocoder is a complete agentic coding platform with a JavaScript/Express backend, a React frontend, Firebase Google login, and persistent history storage. It implements a three‑stage agent pipeline (Planner → Architect → Coder) and exposes it through HTTP APIs so a UI or other clients can drive the agent.

---

## What This Repo Contains
- **Backend (Express)**: Runs the agent pipeline, provides APIs, and writes code safely to a workspace directory.
- **Frontend (React + Vite)**: Google login, prompt input, run status, and session history.
- **Database (SQLite)**: Stores users, sessions, messages, and file changes.

---

## Tech Stack
- **Backend**: Node.js, Express, better-sqlite3, zod
- **Frontend**: React 18, Vite, Firebase Auth
- **Database**: SQLite (schema in `backend/src/db/schema.sql`)
- **LLM Provider**: Groq OpenAI‑compatible API (default)

---

## Architecture (High Level)
1. **Planner**: Turns a user prompt into a structured plan JSON.
2. **Architect**: Breaks the plan into implementation steps.
3. **Coder**: Produces file operations, applied safely inside a workspace root.
4. **History**: Sessions, messages, and file changes are persisted in SQLite.

---

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend default: `http://localhost:4000`

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend default: `http://localhost:5173`

### Firebase
Create a Firebase Web App and set the values in `frontend/.env`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

---

## Environment Variables

### Backend (`backend/.env`)
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `DB_PATH=./data/agent.db`
- `WORKSPACE_ROOT=../workspace`
- `LLM_MODE=stub` (use `live` to enable the LLM)
- `LLM_API_KEY=your_groq_api_key_here`
- `LLM_ENDPOINT=https://api.groq.com/openai/v1/chat/completions`
- `LLM_MODEL=llama-3.1-70b-versatile`

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL=http://localhost:4000`
- `VITE_FIREBASE_API_KEY=...`
- `VITE_FIREBASE_AUTH_DOMAIN=...`
- `VITE_FIREBASE_PROJECT_ID=...`
- `VITE_FIREBASE_APP_ID=...`

---

## API Overview
- `POST /api/auth/login` — upsert a user
- `POST /api/agent/run` — run the agent on a prompt
- `GET /api/history/:userId` — list sessions for a user
- `GET /api/session/:sessionId` — session messages + file changes
- `POST /api/files/read` — read a file from the workspace
- `POST /api/files/write` — write a file to the workspace
- `GET /api/files/list` — list workspace files

---

## Database Schema
Defined in `backend/src/db/schema.sql`.
- `users`: auth profile
- `sessions`: each run with prompt/status
- `messages`: planner/architect/coder payloads
- `file_changes`: tracked write/delete operations

---

## Security Notes
- Never commit `.env` files or API keys.
- File writes are restricted to the configured workspace root.
- Review generated code before executing it.

---

## Key Files
- `backend/src/index.js` — Express entry point
- `backend/src/agent/agent.js` — agent pipeline
- `backend/src/agent/prompts.js` — prompts for Planner/Architect/Coder
- `backend/src/db/schema.sql` — database schema
- `frontend/src/App.jsx` — auth-aware shell
- `frontend/src/pages/Login.jsx` — Google login page
- `frontend/src/pages/Dashboard.jsx` — agent control + history

---

## Example Prompt
"Build a colourful modern todo app in html css and js"

---

## Contributing
PRs welcome. Add a license if you want to publish it publicly.
