import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { getMigrations } from "better-auth/db/migration";
import { initDb } from "./db/db.js";
import { ensureWorkspaceRoot } from "./utils/safePath.js";
import { agentRoutes } from "./routes/agent.js";
import { historyRoutes } from "./routes/history.js";
import { fileRoutes } from "./routes/files.js";
import { auth } from "./auth.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

// better-auth handler must be mounted before express.json()
// Use middleware form so req.url is preserved with the full path
const authHandler = toNodeHandler(auth);
app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth")) return authHandler(req, res, next);
  next();
});

app.use(express.json({ limit: "2mb" }));

const dbPath = process.env.DB_PATH || path.resolve("./data/agent.db");
const db = initDb(dbPath);

const workspaceRoot = ensureWorkspaceRoot(
  process.env.WORKSPACE_ROOT || path.resolve("../workspace")
);

const isOllamaMode = (process.env.LLM_MODE || "stub") === "ollama";
const llmConfig = {
  mode: process.env.LLM_MODE || "stub",
  apiKey: process.env.LLM_API_KEY || "",
  endpoint: process.env.LLM_ENDPOINT || (
    isOllamaMode
      ? `http://${process.env.OLLAMA_HOST || "localhost:11434"}/v1/chat/completions`
      : "https://openrouter.ai/api/v1/chat/completions"
  ),
  model: process.env.LLM_MODEL || (isOllamaMode ? "llama3.2" : "meta-llama/llama-3.1-70b-instruct"),
  siteUrl: process.env.SITE_URL || "",
  siteName: process.env.SITE_NAME || "autocoder",
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "up" });
});

app.use("/api/agent", agentRoutes({ db, workspaceRoot, config: llmConfig }));
app.use("/api", historyRoutes({ db }));
app.use("/api/files", fileRoutes({ workspaceRoot }));

async function start() {
  // Run better-auth database migrations on startup
  try {
    const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);
    if (toBeCreated.length || toBeAdded.length) {
      console.log("Running better-auth migrations...");
      await runMigrations();
      console.log("Migrations complete.");
    }
  } catch (err) {
    console.warn("Migration warning (safe to ignore if tables already exist):", err.message);
  }

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
    console.log(`Workspace root: ${workspaceRoot}`);
  });
}

start();
