import fs from "fs";
import path from "path";
import crypto from "crypto";
import { plannerPrompt, architectPrompt, coderPrompt } from "./prompts.js";
import { resolveWorkspacePath } from "../utils/safePath.js";

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function callLLM({ messages, config }) {
  if (config.mode === "stub" || !config.apiKey || !config.endpoint) {
    return JSON.stringify({
      summary: "Stub plan",
      goals: ["Add provider credentials", "Run agent"],
      files: ["README.md"],
      steps: [
        { id: "step-1", description: "Create a README stub", files: ["README.md"] }
      ],
      operations: [
        { path: "README.md", content: "# Workspace\n\nAgent output placeholder.\n", operation: "write" }
      ]
    });
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };
  if (config.siteUrl) headers["HTTP-Referer"] = config.siteUrl;
  if (config.siteName) headers["X-Title"] = config.siteName;

  const res = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty response");
  }
  return content;
}

function listWorkspaceFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        files.push(path.relative(root, full));
      }
    }
  };
  walk(root);
  return files;
}

function readWorkspaceSnapshot(root, files) {
  const snippets = [];
  for (const file of files.slice(0, 20)) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf8");
    snippets.push(`--- ${file} ---\n${content.slice(0, 2000)}`);
  }
  return snippets.join("\n\n");
}

function applyOperations(root, operations) {
  const changes = [];
  for (const op of operations) {
    const target = resolveWorkspacePath(root, op.path);
    if (op.operation === "delete") {
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      changes.push({ path: op.path, operation: "delete", content: null });
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, op.content || "", "utf8");
    changes.push({ path: op.path, operation: "write", content: op.content || "" });
  }
  return changes;
}

export async function runAgent({ prompt, workspaceRoot, db, userId, config }) {
  const sessionId = crypto.randomUUID();
  const createdAt = nowIso();

  db.prepare("INSERT INTO sessions (id, user_id, prompt, status, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(sessionId, userId, prompt, "running", createdAt);

  const fileList = listWorkspaceFiles(workspaceRoot).join("\n") || "(empty)";

  const planRaw = await callLLM({
    messages: plannerPrompt(prompt, fileList),
    config,
  });
  const plan = safeJsonParse(planRaw, { summary: "", goals: [], files: [] });

  db.prepare("INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), sessionId, "planner", JSON.stringify(plan), nowIso());

  const architectRaw = await callLLM({
    messages: architectPrompt(JSON.stringify(plan)),
    config,
  });
  const architect = safeJsonParse(architectRaw, { steps: [] });

  db.prepare("INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), sessionId, "architect", JSON.stringify(architect), nowIso());

  const steps = Array.isArray(architect.steps) ? architect.steps : [];
  let allChanges = [];

  for (const step of steps) {
    const snapshot = readWorkspaceSnapshot(workspaceRoot, listWorkspaceFiles(workspaceRoot));
    const coderRaw = await callLLM({
      messages: coderPrompt(step, snapshot),
      config,
    });
    const coder = safeJsonParse(coderRaw, { operations: [] });
    const operations = Array.isArray(coder.operations) ? coder.operations : [];
    const changes = applyOperations(workspaceRoot, operations);
    allChanges = allChanges.concat(changes);

    for (const change of changes) {
      db.prepare("INSERT INTO file_changes (id, session_id, path, operation, content, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(crypto.randomUUID(), sessionId, change.path, change.operation, change.content, nowIso());
    }

    db.prepare("INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(crypto.randomUUID(), sessionId, "coder", JSON.stringify({ step, operations }), nowIso());
  }

  db.prepare("UPDATE sessions SET status = ? WHERE id = ?").run("done", sessionId);

  return { sessionId, plan, steps, changes: allChanges };
}
