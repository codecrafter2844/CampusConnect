import { useState } from "react";
import { api } from "./api";

const COPY = {
  admin: {
    eyebrow: "COLLEGE ADMIN",
    title: "Admin sign in",
    hint: "Manage club accounts, events, registrations and payments for the whole college.",
    label: "Admin email",
    placeholder: "admin@college.edu",
    path: "/api/admin/auth/login",
    type: "email",
  },
  organizer: {
    eyebrow: "CLUB ORGANIZER",
    title: "Organizer sign in",
    hint: "Use the login ID and temporary password the college admin gave your club.",
    label: "Login ID",
    placeholder: "codingclub-4821",
    path: "/api/organizer/auth/login",
    type: "text",
  },
};

function StaffLogin({ kind, onSuccess }) {
  const copy = COPY[kind];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await api(copy.path, {
        method: "POST",
        body: { username: username.trim(), password },
      });
      onSuccess(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="st-login-page">
      <form className="st-login-card" onSubmit={submit}>
        <a className="st-brand" href="/">
          Campus<span>Connect</span>
        </a>
        <p className="st-eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="st-muted">{copy.hint}</p>

        <label className="st-field">
          <span>{copy.label}</span>
          <input
            type={copy.type}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={copy.placeholder}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="st-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="st-error" role="alert">{error}</p>}

        <button className="st-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in →"}
        </button>

        <p className="st-login-foot">
          {kind === "admin" ? (
            <>Club organizer? <a href="/organizer">Organizer login</a></>
          ) : (
            <>College admin? <a href="/admin">Admin login</a></>
          )}
          {" · "}
          <a href="/">Student site</a>
        </p>
      </form>
    </div>
  );
}

export default StaffLogin;
