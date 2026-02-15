import express from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { resolveWorkspacePath } from "../utils/safePath.js";

const router = express.Router();

const readSchema = z.object({
  path: z.string().min(1),
});

const writeSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export function fileRoutes({ workspaceRoot }) {
  router.post("/read", (req, res) => {
    const parsed = readSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const target = resolveWorkspacePath(workspaceRoot, parsed.data.path);
    if (!fs.existsSync(target)) {
      return res.status(404).json({ error: "File not found" });
    }
    const content = fs.readFileSync(target, "utf8");
    return res.json({ content });
  });

  router.post("/write", (req, res) => {
    const parsed = writeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const target = resolveWorkspacePath(workspaceRoot, parsed.data.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, parsed.data.content, "utf8");
    return res.json({ ok: true });
  });

  router.get("/list", (_req, res) => {
    const files = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".")) continue;
        const full = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(full);
        else files.push(full.replace(`${workspaceRoot}/`, ""));
      }
    };
    walk(workspaceRoot);
    return res.json({ files });
  });

  return router;
}
