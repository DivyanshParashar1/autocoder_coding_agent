const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function runAgent({ prompt }) {
  const res = await fetch(`${API_BASE}/api/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Agent run failed");
  }
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/api/history`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("History fetch failed");
  return res.json();
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/session/${sessionId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session fetch failed");
  return res.json();
}
