import { authClient } from "./lib/auth.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const { data: session, isPending, error } = authClient.useSession();

  async function handleLogin() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }

  async function handleLogout() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => {} } });
  }

  if (isPending) {
    return (
      <div className="app-shell">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        photoUrl: session.user.image,
        provider: "google",
      }
    : null;

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} error={error?.message || ""} />
  );
}
