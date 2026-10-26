
import { useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import "./Home.css";
import Sidebar from "../components/Sidebar";

const CATEGORIES = [
  "All Events",
  "Technical",
  "Workshop",
  "Cultural",
  "Sports",
  "Seminar",
  "Other",
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "⌂", section: "Dashboard" },
  { label: "All Events", icon: "▦", section: "Explore Events" },
  { label: "My Registrations", icon: "✓", section: "My Registrations" },
  { label: "Profile", icon: "♙", section: "Profile" },
];

function getEventDate(event) {
  const raw = event.startDateTime || event.startDate || event.date;
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function Home({
  
  events = [],
  loading = false,
  eventError = "",
  search = "",
  setSearch = () => { },
  category = "All Events",
  setCategory = () => { },
  onOpenEvent = () => { },
  onRegister = () => { },
  student = null,
  openAuth = () => { },
  setStudentSection = () => { },
  studentSection = "Dashboard",
}) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const datedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        calendarDate: getEventDate(event),
      })),
    [events]
  );

  const liveEvents = datedEvents.filter((event) => {
    const start = event.calendarDate;
    if (!start) return false;

    const end = event.endDateTime ? new Date(event.endDateTime) : null;
    const now = new Date();

    return (
      start <= now &&
      (end && !Number.isNaN(end.getTime())
        ? end >= now
        : start.toDateString() === now.toDateString())
    );
  });

  const upcomingEvents = datedEvents
    .filter((event) => event.calendarDate && event.calendarDate > today)
    .sort((a, b) => a.calendarDate - b.calendarDate);

  const visibleEvents = datedEvents.filter((event) => {
    const title = event.displayTitle || event.title || "";
    const eventCategory = event.displayCategory || event.category || "Other";
    const query = search.trim().toLowerCase();

    return (
      (title.toLowerCase().includes(query) ||
        eventCategory.toLowerCase().includes(query)) &&
      (category === "All Events" || eventCategory === category)
    );
  });

  const month = calendarDate.getMonth();
  const year = calendarDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDays = new Set(
    datedEvents
      .filter(
        (event) =>
          event.calendarDate &&
          event.calendarDate.getFullYear() === year &&
          event.calendarDate.getMonth() === month
      )
      .map((event) => event.calendarDate.getDate())
  );

  function changeMonth(offset) {
    setCalendarDate(new Date(year, month + offset, 1));
  }

  function formatDate(date) {
    if (!date) return "Date to be announced";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function goToSection(section) {
    if (section === "My Registrations" || section === "Profile") {
      if (!student) {
        openAuth("login");
        return;
      }
    }

    setStudentSection(section);
  }

  return (
    <div
      className={`dashboard-layout ${sidebarOpen ? "" : "sidebar-collapsed"}`}
    >
      <Sidebar
        studentSection={studentSection}
        setStudentSection={setStudentSection}
        student={student}
        openAuth={openAuth}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <main className="dashboard-main" id="dashboard">
        <header className="dashboard-topbar">
          <div className="dashboard-heading-group">
            <p className="dashboard-welcome">
              Welcome{student?.name ? `, ${student.name}` : ""}

            </p>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
              Discover what's happening in your campus community.
            </p>
          </div>

          <div className="dashboard-topbar-actions">
            {student ? (
              <button
                className="dashboard-avatar"
                type="button"
                title="Open profile"
                onClick={() => goToSection("Profile")}
              >
                {(student.name || "S").charAt(0).toUpperCase()}
              </button>
            ) : (

              <div className="dashboard-auth-actions">
                <button
                  className="dashboard-login"
                  type="button"
                  onClick={() => openAuth("login")}
                >
                  Log in
                </button>
              </div>

            )}
          </div>
        </header>

        {studentSection === "My Registrations" && student ? (
          <section className="dashboard-panel">
            <h2>My Registrations</h2>
            <p>Use the My Registrations page to view your registered events.</p>
            <button
              className="dashboard-primary-button"
              type="button"
              onClick={() => setStudentSection("My Registrations")}
            >
              Open registrations
            </button>
          </section>
        ) : studentSection === "Profile" && student ? (
          <section className="dashboard-panel">
            <h2>Your profile</h2>
            <p>{student.name}</p>
            <p>{student.email}</p>
          </section>
        ) : (
          <>
            <section className="dashboard-banner-grid">
              <article className="dashboard-banner live-banner">
                <div className="dashboard-banner-heading">
                  <span className="dashboard-banner-icon">◉</span>
                  <span className="dashboard-status">
                    <span className="dashboard-status-dot" />
                    LIVE NOW
                  </span>
                </div>

                <p className="dashboard-banner-label">HAPPENING ON CAMPUS</p>
                <h2>
                  {liveEvents.length
                    ? liveEvents[0].displayTitle || liveEvents[0].title
                    : "Live events"}
                </h2>
                <p className="dashboard-banner-description">
                  {liveEvents.length
                    ? `${liveEvents.length} event${liveEvents.length === 1 ? "" : "s"} happening now`
                    : "Stay connected with activities happening on campus."}
                </p>

                <button
                  type="button"
                  className="dashboard-banner-button"
                  onClick={() =>
                    liveEvents.length
                      ? onOpenEvent(liveEvents[0])
                      : setStudentSection("Explore Events")
                  }
                >
                  {liveEvents.length ? "View details →" : "Explore events →"}
                </button>
                <span className="dashboard-banner-decoration">✦</span>
              </article>

              <article className="dashboard-banner upcoming-banner">
                <div className="dashboard-banner-heading">
                  <span className="dashboard-banner-icon">▦</span>
                  <span className="dashboard-banner-label">COMING UP</span>
                </div>

                <p className="dashboard-banner-label">YOUR NEXT EXPERIENCE</p>
                <h2>
                  {upcomingEvents.length
                    ? upcomingEvents[0].displayTitle ||
                    upcomingEvents[0].title
                    : "Something exciting awaits"}
                </h2>
                <p className="dashboard-banner-description">
                  {upcomingEvents.length
                    ? `${formatDate(upcomingEvents[0].calendarDate)} · ${upcomingEvents[0].displayTime ||
                    upcomingEvents[0].time ||
                    "Time TBA"
                    }`
                    : "Discover workshops, fests and campus activities."}
                </p>

                <button
                  type="button"
                  className="dashboard-banner-button"
                  onClick={() =>
                    upcomingEvents.length
                      ? onOpenEvent(upcomingEvents[0])
                      : setStudentSection("Explore Events")
                  }
                >
                  {upcomingEvents.length
                    ? "View details →"
                    : "Find an event →"}
                </button>
                <span className="dashboard-banner-decoration">✧</span>
              </article>
            </section>

            <section className="dashboard-content-grid">
              <article className="dashboard-card dashboard-events-card">
                <div className="dashboard-card-heading">
                  <div>
                    <p className="dashboard-eyebrow">CAMPUS COMMUNITY</p>
                    <h2>All campus events</h2>
                    <p className="dashboard-muted">
                      Find your next campus experience.
                    </p>
                  </div>
                  <span className="dashboard-event-count">
                    {visibleEvents.length} events
                  </span>
                </div>

                <label className="dashboard-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search events..."
                    aria-label="Search campus events"
                  />
                </label>

                <div className="dashboard-filter-list">
                  {CATEGORIES.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        category === item ? "dashboard-filter active" : "dashboard-filter"
                      }
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="dashboard-table-state">
                    Loading campus events...
                  </div>
                ) : eventError ? (
                  <div className="dashboard-table-state">{eventError}</div>
                ) : visibleEvents.length === 0 ? (
                  <div className="dashboard-table-state">
                    <span className="dashboard-empty-icon">✦</span>
                    <strong>No events to show yet</strong>
                    <p>
                      {events.length === 0
                        ? "Events will appear here when they are added to CampusConnect."
                        : "Try changing your search or category filter."}
                    </p>
                    {events.length > 0 && (
                      <button
                        type="button"
                        className="dashboard-view-all"
                        onClick={() => {
                          setSearch("");
                          setCategory("All Events");
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="dashboard-event-list">
                    {visibleEvents.map((event, index) => (
                      <EventCard
                        key={event.id ?? `${event.title}-${index}`}
                        event={{
                          ...event,
                          displayDate:
                            event.displayDate ||
                            (event.calendarDate
                              ? formatDate(event.calendarDate)
                              : undefined),
                        }}
                        onOpen={onOpenEvent}
                        onRegister={onRegister}
                      />
                    ))}
                  </div>
                )}
              </article>

              <article className="dashboard-card dashboard-calendar-card">
                <div className="dashboard-card-heading">
                  <div>
                    <p className="dashboard-eyebrow">PLAN AHEAD</p>
                    <h2>Event calendar</h2>
                    <p className="dashboard-muted">
                      Select a highlighted date to view an event.
                    </p>
                  </div>
                  <span className="dashboard-calendar-symbol">▦</span>
                </div>

                <div className="dashboard-calendar-month">
                  <strong>
                    {calendarDate.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                  <div className="dashboard-calendar-controls">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="dashboard-calendar-grid">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span className="calendar-weekday" key={day}>
                      {day}
                    </span>
                  ))}

                  {Array.from({ length: firstDay }, (_, index) => (
                    <span
                      className="calendar-empty"
                      key={`empty-${index}`}
                    />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1;
                    const isToday =
                      day === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();

                    return (
                      <button
                        type="button"
                        key={day}
                        className={[
                          "calendar-day",
                          eventDays.has(day) ? "has-event" : "",
                          isToday ? "calendar-today" : "",
                        ].filter(Boolean).join(" ")}
                        title={
                          eventDays.has(day)
                            ? "Event scheduled"
                            : `Day ${day}`
                        }
                        onClick={() => {
                          const matching = datedEvents.filter(
                            (event) =>
                              event.calendarDate &&
                              event.calendarDate.getFullYear() === year &&
                              event.calendarDate.getMonth() === month &&
                              event.calendarDate.getDate() === day
                          );

                          if (matching.length) onOpenEvent(matching[0]);
                        }}
                      >
                        {day}
                        {eventDays.has(day) && (
                          <span className="calendar-event-dot" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="dashboard-calendar-legend">
                  <span className="dashboard-legend-dot" />
                  Event scheduled
                </div>

                <div className="dashboard-upcoming-list">
                  <h3>Upcoming events</h3>
                  {upcomingEvents.length ? (
                    upcomingEvents.slice(0, 3).map((event, index) => (
                      <button
                        type="button"
                        className="dashboard-upcoming-item"
                        key={event.id ?? `${event.title}-${index}`}
                        onClick={() => onOpenEvent(event)}
                      >
                        <span className="upcoming-date">
                          <strong>{event.calendarDate.getDate()}</strong>
                          <small>
                            {event.calendarDate.toLocaleDateString("en-IN", {
                              month: "short",
                            })}
                          </small>
                        </span>
                        <span className="upcoming-event-name">
                          <strong>
                            {event.displayTitle || event.title}
                          </strong>
                          <small>
                            {event.displayTime || event.time || "Time TBA"}
                          </small>
                        </span>
                        <span className="upcoming-arrow">→</span>
                      </button>
                    ))
                  ) : (
                    <p className="dashboard-no-upcoming">
                      No upcoming events yet.
                    </p>
                  )}
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
