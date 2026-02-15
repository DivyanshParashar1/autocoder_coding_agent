import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { loginUser } from "./lib/api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setError("");
      if (nextUser) {
        const profile = {
          id: nextUser.uid,
          email: nextUser.email,
          name: nextUser.displayName,
          photoUrl: nextUser.photoURL,
          provider: "google",
        };
        try {
          await loginUser(profile);
        } catch (err) {
          setError(err.message || "Failed to sync user");
        }
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleLogin() {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  async function handleLogout() {
    setError("");
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message || "Logout failed");
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} error={error} />
  ) : (
    <Login onLogin={handleLogin} error={error} />
  );
}
