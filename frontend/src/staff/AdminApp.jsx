import { useCallback, useEffect, useState } from "react";
import "./staff.css";
import { api, isSessionError, loadSession, money, saveSession } from "./api";
import StaffLogin from "./StaffLogin";
import Shell from "./Shell";
import Modal from "./Modal";
import StatCards from "./StatCards";
import EventsManager from "./EventsManager";
import RegistrationsTable from "./RegistrationsTable";

const KEY = "cc_admin_session";

const NAV = [
  { key: "overview", label: "Overview", icon: "▦" },
  { key: "clubs", label: "Club accounts", icon: "♟" },
  { key: "events", label: "All events", icon: "◷" },
  { key: "registrations", label: "Registrations & payments", icon: "✓" },
];

function Credentials({ data, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = `CampusConnect organizer login\nClub: ${data.clubName}\nLogin ID: ${data.loginId}\nTemporary password: ${data.temporaryPassword}\nSign in at: ${window.location.origin}/organizer`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Modal title="Club login ready" onClose={onClose}>
      <p className="st-modal-text">{data.message}</p>
      <dl className="st-credentials">
        <div><dt>Club</dt><dd>{data.clubName}</dd></div>
        <div><dt>Login ID</dt><dd className="mono">{data.loginId}</dd></div>
        <div><dt>Temporary password</dt><dd className="mono">{data.temporaryPassword}</dd></div>
      </dl>
      <p className="st-hint">The club will be asked to choose a new password the first time they sign in.</p>
      <div className="st-actions">
        <button type="button" className="st-ghost" onClick={copy}>{copied ? "Copied ✓" : "Copy details"}</button>
        <button type="button" className="st-primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

function NewClubModal({ onClose, onCreate }) {
  const [clubName, setClubName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onCreate({ clubName: clubName.trim(), contactEmail: contactEmail.trim() || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title="Create club login" onClose={onClose}>
      <form className="st-form single" onSubmit={submit}>
        <label className="st-field">
          <span>Club name</span>
          <input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Coding Club" required maxLength={100} autoFocus />
        </label>
        <label className="st-field">
          <span>Club contact email (optional)</span>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="club@college.edu" />
        </label>
        <p className="st-hint">The login ID and a temporary password are generated for you.</p>
        {error && <p className="st-error" role="alert">{error}</p>}
        <div className="st-actions">
          <button type="button" className="st-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="st-primary" disabled={saving}>{saving ? "Creating..." : "Create login"}</button>
        </div>
      </form>
    </Modal>
  );
}

function AdminApp() {
  const [session, setSession] = useState(() => loadSession(KEY));
  const [section, setSection] = useState("overview");
  const [notice, setNotice] = useState(null);

  const [summary, setSummary] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [regEventId, setRegEventId] = useState("ALL");
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  const [showNewClub, setShowNewClub] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const token = session?.token;

  const logout = useCallback((text) => {
    saveSession(KEY, null);
    setSession(null);
    setSummary(null);
    setOrganizers([]);
    setEvents([]);
    setRegistrations([]);
    setSection("overview");
    setNotice(text ? { type: "info", text } : null);
  }, []);

  // Runs an action; shows its error or signs out when the session is invalid.
  const guard = useCallback(async (action) => {
    try {
      return await action();
    } catch (err) {
      if (isSessionError(err)) {
        logout("Your session expired. Please sign in again.");
      } else {
        setNotice({ type: "error", text: err.message });
      }
      return undefined;
    }
  }, [logout]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await guard(async () => {
      const [s, o, e] = await Promise.all([
        api("/api/admin/summary", { token }),
        api("/api/admin/organizers", { token }),
        api("/api/admin/events", { token }),
      ]);
      setSummary(s);
      setOrganizers(o);
      setEvents(e);
    });
    setLoading(false);
  }, [token, guard]);

  const loadRegistrations = useCallback(async (eventId) => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    setRegLoading(true);
    await guard(async () => {
      const query = eventId === "ALL" ? "" : `?eventId=${eventId}`;
      setRegistrations(await api(`/api/admin/registrations${query}`, { token }));
    });
    setRegLoading(false);
  }, [token, guard]);

  useEffect(() => {
    if (token) loadAll();
  }, [token, loadAll]);

  useEffect(() => {
    if (token && section === "registrations") loadRegistrations(regEventId);
  }, [token, section, regEventId, loadRegistrations]);

  function handleLogin(data) {
    saveSession(KEY, data);
    setSession(data);
    setNotice(null);
  }

  if (!session) {
    return (
      <>
        {notice && <div className="st-notice floating" role="status">{notice.text}</div>}
        <StaffLogin kind="admin" onSuccess={handleLogin} />
      </>
    );
  }

  const refreshSummary = async () => {
    await guard(async () => setSummary(await api("/api/admin/summary", { token })));
  };

  async function createClub(payload) {
    const created = await api("/api/admin/organizers", { method: "POST", token, body: payload });
    setShowNewClub(false);
    setCredentials(created);
    await loadAll();
  }

  async function resetPassword(org) {
    await guard(async () => {
      const result = await api(`/api/admin/organizers/${org.id}/reset-password`, { method: "POST", token });
      setCredentials(result);
      await loadAll();
    });
  }

  async function toggleActive(org) {
    await guard(async () => {
      await api(`/api/admin/organizers/${org.id}/active`, { method: "PUT", token, body: { active: !org.active } });
      setNotice({ type: "info", text: `${org.clubName} ${org.active ? "deactivated" : "reactivated"}.` });
      await loadAll();
    });
  }

  async function saveEvent(method, path, payload, doneText) {
    await api(path, { method, token, body: payload });
    setNotice({ type: "info", text: doneText });
    await loadAll();
  }

  async function deleteEvent(event) {
    await guard(async () => {
      const result = await api(`/api/admin/events/${event.id}`, { method: "DELETE", token });
      const extra = result.registrationsCancelled
        ? ` ${result.registrationsCancelled} registration(s) cancelled and students notified${result.refundsPending ? `; ${result.refundsPending} payment(s) marked for refund` : ""}.`
        : "";
      setNotice({ type: "info", text: `"${event.title}" deleted.${extra}` });
      await loadAll();
    });
  }

  async function markRefunded(row) {
    await guard(async () => {
      await api(`/api/admin/registrations/${row.registrationId}/refunded`, { method: "POST", token });
      setNotice({ type: "info", text: `Refund recorded for ${row.studentName}.` });
      await loadRegistrations(regEventId);
      await refreshSummary();
    });
  }

  function viewRegistrations(event) {
    setRegEventId(String(event.id));
    setSection("registrations");
  }

  const subtitles = {
    overview: "College-wide numbers at a glance.",
    clubs: "Each club gets one organizer login, created here only.",
    events: "Create, edit or delete events for any club.",
    registrations: "Every registration and payment across the college.",
  };

  return (
    <Shell
      title="ADMIN"
      subtitle={subtitles[section]}
      nav={NAV}
      section={section}
      setSection={setSection}
      user={session.name}
      onLogout={() => logout()}
      notice={notice}
      onDismissNotice={() => setNotice(null)}
    >
      {section === "overview" && (
        <>
          <StatCards
            items={[
              { label: "Students", value: summary?.students ?? "-" },
              { label: "Club accounts", value: summary?.organizers ?? "-" },
              { label: "Live events", value: summary?.events ?? "-" },
              { label: "Confirmed registrations", value: summary?.registrations ?? "-" },
              { label: "Payments collected", value: summary ? money(summary.revenue) : "-", hint: summary ? `${summary.paidRegistrations} paid` : "", tone: "green" },
              { label: "Refunds due", value: summary ? money(summary.refundsPendingAmount) : "-", hint: summary ? `${summary.refundsPending} payment(s)` : "", tone: summary?.refundsPending ? "red" : "" },
            ]}
          />
          <div className="st-card st-callout">
            <h2>How it works</h2>
            <ol>
              <li>Create a club login in <strong>Club accounts</strong> and hand the ID and temporary password to the club.</li>
              <li>The club signs in at <code>/organizer</code>, sets its own password and publishes events.</li>
              <li>Students register and pay through Razorpay. You can see every payment under <strong>Registrations &amp; payments</strong>.</li>
            </ol>
          </div>
        </>
      )}

      {section === "clubs" && (
        <>
          <div className="st-toolbar">
            <p className="st-muted">{organizers.length} club account{organizers.length === 1 ? "" : "s"}</p>
            <button type="button" className="st-primary" onClick={() => setShowNewClub(true)}>+ Create club login</button>
          </div>
          <div className="st-card st-table-wrap">
            {organizers.length === 0 ? (
              <p className="st-empty">{loading ? "Loading..." : "No clubs yet. Create the first club login."}</p>
            ) : (
              <table className="st-table">
                <thead>
                  <tr><th>Club</th><th>Login ID</th><th>Events</th><th>Status</th><th aria-label="Actions" /></tr>
                </thead>
                <tbody>
                  {organizers.map((o) => (
                    <tr key={o.id}>
                      <td><strong>{o.clubName}</strong><span className="st-sub">{o.contactEmail || "No contact email"}</span></td>
                      <td className="mono">{o.loginId}</td>
                      <td>{o.eventCount}</td>
                      <td>
                        {!o.active ? <span className="st-pill red">Deactivated</span>
                          : o.mustChangePassword ? <span className="st-pill amber">Awaiting first login</span>
                          : <span className="st-pill green">Active</span>}
                      </td>
                      <td className="st-row-actions">
                        <button type="button" className="st-link" onClick={() => resetPassword(o)}>Reset password</button>
                        <button type="button" className={`st-link ${o.active ? "danger" : ""}`} onClick={() => toggleActive(o)}>
                          {o.active ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {section === "events" && (
        <EventsManager
          events={events}
          loading={loading}
          organizers={organizers}
          showClub
          onCreate={(payload) => saveEvent("POST", "/api/admin/events", payload, "Event created.")}
          onUpdate={(id, payload) => saveEvent("PUT", `/api/admin/events/${id}`, payload, "Event updated.")}
          onDelete={deleteEvent}
          onViewRegistrations={viewRegistrations}
        />
      )}

      {section === "registrations" && (
        <RegistrationsTable
          rows={registrations}
          loading={regLoading}
          events={events}
          eventId={regEventId}
          setEventId={setRegEventId}
          showClub
          allowAll
          onRefunded={markRefunded}
        />
      )}

      {showNewClub && <NewClubModal onClose={() => setShowNewClub(false)} onCreate={createClub} />}
      {credentials && <Credentials data={credentials} onClose={() => setCredentials(null)} />}
    </Shell>
  );
}

export default AdminApp;
