import { useCallback, useEffect, useState } from "react";
import "./staff.css";
import { api, formatDate, isSessionError, loadSession, money, saveSession } from "./api";
import StaffLogin from "./StaffLogin";
import ChangePassword from "./ChangePassword";
import Shell from "./Shell";
import StatCards from "./StatCards";
import EventsManager from "./EventsManager";
import RegistrationsTable from "./RegistrationsTable";

const KEY = "cc_organizer_session";

const NAV = [
  { key: "overview", label: "Overview", icon: "▦" },
  { key: "events", label: "My events", icon: "◷" },
  { key: "registrations", label: "Registered students", icon: "✓" },
];

function OrganizerApp() {
  const [session, setSession] = useState(() => loadSession(KEY));
  const [section, setSection] = useState("overview");
  const [notice, setNotice] = useState(null);

  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [regEventId, setRegEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  const token = session?.token;
  const mustChange = Boolean(session?.mustChangePassword);

  const logout = useCallback((text) => {
    saveSession(KEY, null);
    setSession(null);
    setSummary(null);
    setEvents([]);
    setRegistrations([]);
    setRegEventId("");
    setSection("overview");
    setNotice(text ? { type: "info", text } : null);
  }, []);

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
      const [s, e] = await Promise.all([
        api("/api/organizer/summary", { token }),
        api("/api/organizer/events", { token }),
      ]);
      setSummary(s);
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
      setRegistrations(await api(`/api/organizer/events/${eventId}/registrations`, { token }));
    });
    setRegLoading(false);
  }, [token, guard]);

  useEffect(() => {
    if (token && !mustChange) loadAll();
  }, [token, mustChange, loadAll]);

  // Default the student list to the first event.
  useEffect(() => {
    if (!regEventId && events.length > 0) setRegEventId(String(events[0].id));
  }, [events, regEventId]);

  useEffect(() => {
    if (token && !mustChange && section === "registrations") loadRegistrations(regEventId);
  }, [token, mustChange, section, regEventId, loadRegistrations]);

  function startSession(data) {
    saveSession(KEY, data);
    setSession(data);
    setNotice(null);
  }

  if (!session) {
    return (
      <>
        {notice && <div className="st-notice floating" role="status">{notice.text}</div>}
        <StaffLogin kind="organizer" onSuccess={startSession} />
      </>
    );
  }

  if (mustChange) {
    return (
      <ChangePassword
        token={token}
        clubName={session.clubName}
        onDone={startSession}
        onLogout={() => logout()}
      />
    );
  }

  async function saveEvent(method, path, payload, doneText) {
    await api(path, { method, token, body: payload });
    setNotice({ type: "info", text: doneText });
    await loadAll();
  }

  async function deleteEvent(event) {
    await guard(async () => {
      const result = await api(`/api/organizer/events/${event.id}`, { method: "DELETE", token });
      const extra = result.registrationsCancelled
        ? ` ${result.registrationsCancelled} student(s) were notified${result.refundsPending ? ` and ${result.refundsPending} payment(s) marked for refund` : ""}.`
        : "";
      setNotice({ type: "info", text: `"${event.title}" deleted.${extra}` });
      if (String(event.id) === regEventId) setRegEventId("");
      await loadAll();
    });
  }

  async function markRefunded(row) {
    await guard(async () => {
      await api(`/api/organizer/registrations/${row.registrationId}/refunded`, { method: "POST", token });
      setNotice({ type: "info", text: `Refund recorded for ${row.studentName}.` });
      await loadRegistrations(regEventId);
      await loadAll();
    });
  }

  function viewRegistrations(event) {
    setRegEventId(String(event.id));
    setSection("registrations");
  }

  const upcoming = [...events]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 5);

  const subtitles = {
    overview: `Welcome, ${session.clubName}.`,
    events: "Create, edit or delete your club's events.",
    registrations: "Who registered, and who has paid.",
  };

  return (
    <Shell
      title="CLUB ORGANIZER"
      subtitle={subtitles[section]}
      nav={NAV}
      section={section}
      setSection={setSection}
      user={session.clubName}
      onLogout={() => logout()}
      notice={notice}
      onDismissNotice={() => setNotice(null)}
    >
      {section === "overview" && (
        <>
          <StatCards
            items={[
              { label: "Your events", value: summary?.events ?? "-" },
              { label: "Confirmed registrations", value: summary?.registrations ?? "-" },
              { label: "Payments collected", value: summary ? money(summary.revenue) : "-", hint: summary ? `${summary.paidRegistrations} paid` : "", tone: "green" },
              { label: "Refunds due", value: summary?.refundsPending ?? "-", tone: summary?.refundsPending ? "red" : "" },
            ]}
          />

          <div className="st-card">
            <div className="st-card-head">
              <h2>Your events</h2>
              <button type="button" className="st-link" onClick={() => setSection("events")}>Manage →</button>
            </div>
            {upcoming.length === 0 ? (
              <p className="st-empty">{loading ? "Loading..." : "You have no events yet. Create your first one under My events."}</p>
            ) : (
              <ul className="st-list">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <div>
                      <strong>{e.title}</strong>
                      <span className="st-sub">{formatDate(e.date)} · {e.location}</span>
                    </div>
                    <div className="st-list-meta">
                      <span>{e.registered} / {e.seats} registered</span>
                      <span>{e.price > 0 ? money(e.revenue) : "Free"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {section === "events" && (
        <EventsManager
          events={events}
          loading={loading}
          onCreate={(payload) => saveEvent("POST", "/api/organizer/events", payload, "Event published.")}
          onUpdate={(id, payload) => saveEvent("PUT", `/api/organizer/events/${id}`, payload, "Event updated.")}
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
          onRefunded={markRefunded}
        />
      )}
    </Shell>
  );
}

export default OrganizerApp;
