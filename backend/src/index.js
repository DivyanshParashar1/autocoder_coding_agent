import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { initDb } from "./db/db.js";
import { ensureWorkspaceRoot } from "./utils/safePath.js";
import { agentRoutes } from "./routes/agent.js";
import { historyRoutes } from "./routes/history.js";
import { fileRoutes } from "./routes/files.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "2mb" }));

const dbPath = process.env.DB_PATH || path.resolve("./data/agent.db");
const db = initDb(dbPath);

const workspaceRoot = ensureWorkspaceRoot(
  process.env.WORKSPACE_ROOT || path.resolve("../workspace")
);

const llmConfig = {
  mode: process.env.LLM_MODE || "stub",
  apiKey: process.env.LLM_API_KEY || "",
  endpoint: process.env.LLM_ENDPOINT || "https://openrouter.ai/api/v1/chat/completions",
  model: process.env.LLM_MODEL || "meta-llama/llama-3.1-70b-instruct",
  siteUrl: process.env.SITE_URL || "",
  siteName: process.env.SITE_NAME || "autocoder",
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "up" });
});

app.use("/api/agent", agentRoutes({ db, workspaceRoot, config: llmConfig }));
app.use("/api", historyRoutes({ db }));
app.use("/api/files", fileRoutes({ workspaceRoot }));

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
  console.log(`Workspace root: ${workspaceRoot}`);
});
