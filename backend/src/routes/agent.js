import express from "express";
import { z } from "zod";
import { runAgent } from "../agent/agent.js";

const router = express.Router();

const runSchema = z.object({
  userId: z.string().min(1),
  prompt: z.string().min(1),
});

export function agentRoutes({ db, workspaceRoot, config }) {
  router.post("/run", async (req, res) => {
    const parsed = runSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const result = await runAgent({
        prompt: parsed.data.prompt,
        workspaceRoot,
        db,
        userId: parsed.data.userId,
        config,
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message || "Agent failed" });
    }
  });

  return router;
}
