import { useEffect, useState } from "react";
import { fetchHistory, runAgent, fetchSession } from "../lib/api.js";

export default function Dashboard({ user, onLogout }) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [selectError, setSelectError] = useState("");

  async function loadHistory() {
    setHistoryError("");
    try {
      const data = await fetchHistory();
      setHistory(data.sessions || []);
    } catch (err) {
      setHistoryError(err.message || "Failed to load history");
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleRun() {
    if (!prompt.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await runAgent({ prompt });
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
    setSelectError("");
    try {
      const data = await fetchSession(sessionId);
      setSelected(data);
    } catch (err) {
      setSelectError(err.message || "Failed to load session");
    }
  }

  function statusClass(status) {
    if (!status) return "";
    if (status === "completed") return "completed";
    if (status === "failed") return "failed";
    return "running";
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1><span className="prompt-char">$</span> agent_control</h1>
          <p>uid:{user.id?.slice(0, 8)}… · {user.email}</p>
        </div>
        <div className="header-right">
          <div className="user-pill">
            <span className="dot" />
            {user.name || user.email}
          </div>
          <button className="ghost-btn" onClick={onLogout}>
            logout
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-label">new task</div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="// describe what you want the agent to build or modify..."
          rows={4}
        />
        <div className="panel-actions">
          <button className="primary-btn" onClick={handleRun} disabled={busy}>
            {busy ? "$ running..." : "$ run agent"}
          </button>
          {message && <span className="status">{message}</span>}
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-label">run history</div>
          {historyError && <div className="error">{historyError}</div>}
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id}>
                <button className="history-item" onClick={() => handleSelect(item.id)}>
                  <div className="prompt-text">{item.prompt}</div>
                  <span className="timestamp">{new Date(item.created_at).toLocaleString()}</span>
                </button>
              </li>
            ))}
            {!history.length && !historyError && (
              <li className="empty">no sessions yet.</li>
            )}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-label">session inspect</div>
          {selectError && <div className="error">{selectError}</div>}
          {selected ? (
            <div className="session-details">
              <div className="detail-row">
                <strong>prompt</strong>
                <span>{selected.session?.prompt}</span>
              </div>
              <div className="detail-row">
                <strong>status</strong>
                <span className={`status-badge ${statusClass(selected.session?.status)}`}>
                  {selected.session?.status || "—"}
                </span>
              </div>
              <div className="detail-row">
                <strong>messages</strong>
                <span>{selected.messages?.length ?? 0}</span>
              </div>
              <div className="detail-row">
                <strong>file changes</strong>
                <span>{selected.fileChanges?.length ?? 0}</span>
              </div>
              <div className="file-list">
                {(selected.fileChanges || []).map((change) => (
                  <div className="file-item" key={change.id}>
                    <span className={`file-op ${change.operation.toUpperCase()}`}>
                      {change.operation.toUpperCase()}
                    </span>
                    <span className="file-path">{change.path}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty">select a session to inspect.</div>
          )}
        </div>
      </section>
    </div>
  );
}
