import { useState } from "react";
import { api } from "./api";

// Shown to a club on first login: the temporary password must be replaced.
function ChangePassword({ token, clubName, onDone, onLogout }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (next.length < 8 || next.length > 72) {
      setError("New password must be 8 to 72 characters.");
      return;
    }
    if (next !== confirm) {
      setError("The two new passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const session = await api("/api/organizer/auth/change-password", {
        method: "POST",
        token,
        body: { currentPassword: current, newPassword: next },
      });
      onDone(session);
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
        <p className="st-eyebrow">FIRST LOGIN</p>
        <h1>Set a new password</h1>
        <p className="st-muted">
          Welcome, {clubName}. For security, replace the temporary password
          before you continue.
        </p>

        <label className="st-field">
          <span>Temporary password</span>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label className="st-field">
          <span>New password</span>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label className="st-field">
          <span>Confirm new password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="st-error" role="alert">{error}</p>}

        <button className="st-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save password and continue →"}
        </button>

        <p className="st-login-foot">
          <button type="button" className="st-link" onClick={onLogout}>
            Sign out
          </button>
        </p>
      </form>
    </div>
  );
}

export default ChangePassword;
