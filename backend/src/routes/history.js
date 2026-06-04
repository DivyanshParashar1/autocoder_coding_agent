import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

export function historyRoutes({ db }) {
  router.get("/history", requireAuth, (req, res) => {
    const sessions = db
      .prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC")
      .all(req.user.id);
    return res.json({ sessions });
  });

  router.get("/session/:sessionId", requireAuth, (req, res) => {
    const { sessionId } = req.params;
    const session = db
      .prepare("SELECT * FROM sessions WHERE id = ? AND user_id = ?")
      .get(sessionId, req.user.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const messages = db
      .prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC")
      .all(sessionId);
    const fileChanges = db
      .prepare("SELECT * FROM file_changes WHERE session_id = ? ORDER BY created_at ASC")
      .all(sessionId);
    return res.json({ session, messages, fileChanges });
  });

  return router;
}
