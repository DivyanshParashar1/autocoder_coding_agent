import React from "react";

export default function Login({ onLogin, error }) {
  return (
    <div className="app-shell">
      <div className="login-card">
        <div className="badge">Autocoder Agent</div>
        <h1>Sign in to your coding workspace</h1>
        <p>
          Build projects with an autonomous agent. Use Google to keep your
          sessions and history synced across devices.
        </p>
        {error ? <div className="error">{error}</div> : null}
        <button className="primary-btn" onClick={onLogin}>
          Continue with Google
        </button>
        <div className="note">
          Your agent runs locally with your own model credentials.
        </div>
      </div>
    </div>
  );
}
