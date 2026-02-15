import express from "express";
import { z } from "zod";

const router = express.Router();

const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().optional(),
  name: z.string().optional(),
  photoUrl: z.string().optional(),
  provider: z.string().optional(),
});

export function historyRoutes({ db }) {
  router.post("/auth/login", (req, res) => {
    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const now = new Date().toISOString();
    const user = parsed.data;

    db.prepare(
      "INSERT INTO users (id, email, name, photo_url, provider, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, photo_url=excluded.photo_url, provider=excluded.provider, last_login_at=excluded.last_login_at"
    ).run(user.id, user.email || null, user.name || null, user.photoUrl || null, user.provider || "google", now, now);

    return res.json({ ok: true });
  });

  router.get("/history/:userId", (req, res) => {
    const { userId } = req.params;
    const sessions = db.prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    return res.json({ sessions });
  });

  router.get("/session/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
    const messages = db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC").all(sessionId);
    const fileChanges = db.prepare("SELECT * FROM file_changes WHERE session_id = ? ORDER BY created_at ASC").all(sessionId);
    return res.json({ session, messages, fileChanges });
  });

  return router;
}
