import React, { useEffect, useState } from "react";
import { fetchHistory, runAgent, fetchSession } from "../lib/api.js";

export default function Dashboard({ user, onLogout, error }) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    const data = await fetchHistory(user.id);
    setHistory(data.sessions || []);
  }

  useEffect(() => {
    loadHistory().catch(() => {});
  }, [user.id]);

  async function handleRun() {
    if (!prompt.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await runAgent({ userId: user.id, prompt });
      setMessage(`Session ${result.sessionId} completed.`);
      setPrompt("");
      await loadHistory();
    } catch (err) {
      setMessage(err.message || "Agent failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSelect(sessionId) {
    const data = await fetchSession(sessionId);
    setSelected(data);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Agent Control</h1>
          <p>Welcome back, {user.name || user.email}</p>
        </div>
        <div className="actions">
          <button className="ghost-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>New task</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want the agent to build or modify..."
          rows={4}
        />
        <div className="panel-actions">
          <button className="primary-btn" onClick={handleRun} disabled={busy}>
            {busy ? "Running..." : "Run agent"}
          </button>
          {message ? <span className="status">{message}</span> : null}
        </div>
        {error ? <div className="error">{error}</div> : null}
      </section>

      <section className="grid">
        <div className="panel">
          <h2>History</h2>
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id}>
                <button className="history-item" onClick={() => handleSelect(item.id)}>
                  <div>{item.prompt}</div>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </button>
              </li>
            ))}
            {!history.length ? <li className="empty">No sessions yet.</li> : null}
          </ul>
        </div>

        <div className="panel">
          <h2>Session details</h2>
          {selected ? (
            <div className="session-details">
              <div className="detail-row">
                <strong>Prompt</strong>
                <span>{selected.session?.prompt}</span>
              </div>
              <div className="detail-row">
                <strong>Status</strong>
                <span>{selected.session?.status}</span>
              </div>
              <div className="detail-row">
                <strong>Messages</strong>
                <span>{selected.messages?.length || 0}</span>
              </div>
              <div className="detail-row">
                <strong>File changes</strong>
                <span>{selected.fileChanges?.length || 0}</span>
              </div>
              <div className="file-list">
                {(selected.fileChanges || []).map((change) => (
                  <div className="file-item" key={change.id}>
                    <span>{change.operation.toUpperCase()}</span>
                    <code>{change.path}</code>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty">Select a session to inspect details.</div>
          )}
        </div>
      </section>
    </div>
  );
}
