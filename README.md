# Autocoder — AI-powered autonomous coding agent

**Autocoder** is now a full-stack agent platform with a JavaScript/Express backend and a React frontend. It keeps the core Planner → Architect → Coder flow, but exposes it through HTTP APIs, a Firebase Google login, and a persistent database for user history.

---

## Key Features
- **Planner**: Converts a user prompt into a structured plan.
- **Architect**: Breaks the plan into explicit implementation steps.
- **Coder**: Produces file operations and edits a safe workspace directory.
- **User auth**: Firebase Google login on the React frontend.
- **History**: SQLite-backed storage for users, sessions, and file changes.

---

## Tech stack & dependencies
- Backend: Node.js, Express, better-sqlite3, zod
- Frontend: React (Vite), Firebase Auth
- Database: SQLite (schema in `backend/src/db/schema.sql`)

---

##  Quick start

1. Backend setup:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
   The backend listens on `http://localhost:4000` by default.

2. Frontend setup:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

3. Configure Firebase:
   - Add a Firebase web app to your project.
   - Paste the config values into `frontend/.env`.

---

## 📁 Project structure (important files)
- `backend/src/index.js` — Express server entry point.
- `backend/src/agent/agent.js` — Planner/Architect/Coder pipeline in JS.
- `backend/src/db/schema.sql` — SQLite schema.
- `frontend/src/App.jsx` — Auth-aware app shell.
- `frontend/src/pages/Login.jsx` — Google login page.
- `frontend/src/pages/Dashboard.jsx` — Agent control panel.

---

## How it works
1. **Planner**: Produces a plan JSON from the user prompt.
2. **Architect**: Produces step JSON from the plan.
3. **Coder**: Produces file operations, safely applied to the workspace root.
4. **History**: Each session stores prompts, messages, and file changes.
