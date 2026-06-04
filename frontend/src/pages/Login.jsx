
export default function Login({ onLogin, error }) {
  return (
    <div className="app-shell">
      <div className="login-card">
        <div className="badge">autocoder_agent</div>
        <h1>Autonomous coding workspace</h1>
        <p>
          An AI agent that writes, modifies, and runs code on your behalf.
          Sign in to keep your sessions and run history synced.
        </p>
        {error ? <div className="error">{error}</div> : null}
        <button className="primary-btn" onClick={onLogin}>
          $ auth --provider google
        </button>
        <div className="note">
          Agent runs locally. Your own model credentials are used.
        </div>
      </div>
    </div>
  );
}