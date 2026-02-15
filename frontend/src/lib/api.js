const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function loginUser(profile) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function runAgent({ userId, prompt }) {
  const res = await fetch(`${API_BASE}/api/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, prompt }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Agent run failed");
  }
  return res.json();
}

export async function fetchHistory(userId) {
  const res = await fetch(`${API_BASE}/api/history/${userId}`);
  if (!res.ok) throw new Error("History fetch failed");
  return res.json();
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/session/${sessionId}`);
  if (!res.ok) throw new Error("Session fetch failed");
  return res.json();
}
