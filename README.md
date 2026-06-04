# Autocoder

An automated coding platform that runs an AI agent pipeline directly on your machine. Describe what you want to build, and Autocoder plans, architects, and writes the code into a sandboxed workspace — using either a local model via Ollama or a cloud model via OpenRouter.

---

## How it works

Every prompt goes through three stages:

1. **Planner** — turns your prompt into a structured goal with a file list
2. **Architect** — breaks the plan into concrete implementation steps
3. **Coder** — writes or edits files in a safe workspace directory for each step

Sessions, messages, and file changes are stored in SQLite so you can review history at any time.

---

## LLM providers

### Ollama (local, no API key)

Run models on your own hardware — no data leaves your machine.

```bash
# pull a model first
ollama pull llama3.2

# then in backend/.env
LLM_MODE=ollama
LLM_MODEL=llama3.2
```

Any model that supports `response_format: json_object` works well: `llama3.2`, `qwen2.5-coder`, `mistral`, `deepseek-coder-v2`, etc. Set `OLLAMA_HOST` if Ollama isn't on the default `localhost:11434`.

### OpenRouter (cloud, heavier tasks)

For tasks that need more capable models (large refactors, complex reasoning).

```bash
# in backend/.env
LLM_MODE=openrouter
LLM_API_KEY=your_openrouter_api_key
LLM_MODEL=meta-llama/llama-3.1-70b-instruct  # or any OpenRouter model
```

OpenRouter gives you access to GPT-4o, Claude, Gemini, Mistral, and more from a single API key.

---

## Quick start

**Backend**
```bash
cd backend
cp .env.example .env   # edit LLM_MODE and credentials
npm install
npm run dev            # http://localhost:4000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

---

## Configuration

All backend config lives in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `LLM_MODE` | `stub` | `ollama`, `openrouter`, or `stub` (no-op) |
| `LLM_MODEL` | `llama3.2` / `llama-3.1-70b` | Model name for the active provider |
| `LLM_API_KEY` | — | OpenRouter API key (not needed for Ollama) |
| `LLM_ENDPOINT` | auto | Override the provider endpoint URL |
| `OLLAMA_HOST` | `localhost:11434` | Ollama host (Ollama mode only) |
| `WORKSPACE_ROOT` | `../workspace` | Directory the agent writes files into |
| `DB_PATH` | `./data/agent.db` | SQLite database path |

---

## Tech stack

- **Backend**: Node.js, Express, better-sqlite3, better-auth, zod
- **Frontend**: React 18, Vite
- **Database**: SQLite
- **Auth**: better-auth (Google OAuth)

---

## Project structure

```
autocoder/
├── backend/
│   └── src/
│       ├── index.js          # Express server entry point
│       ├── agent/
│       │   ├── agent.js      # Planner → Architect → Coder pipeline
│       │   └── prompts.js    # System prompts for each stage
│       ├── routes/
│       │   ├── agent.js      # POST /api/agent/run
│       │   ├── history.js    # GET  /api/sessions
│       │   └── files.js      # GET  /api/files
│       └── db/
│           └── schema.sql    # SQLite schema
└── frontend/
    └── src/
        ├── App.jsx           # Auth-aware app shell
        └── pages/
            ├── Login.jsx     # Google login
            └── Dashboard.jsx # Agent control panel
```
