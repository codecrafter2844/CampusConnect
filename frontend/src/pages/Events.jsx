
import { useMemo, useState } from "react";
import "./Events.css";
import Sidebar from "../components/Sidebar";

const FILTERS = [
  "All Events",
  "Upcoming",
  "Completed",
  "Registered",
  "Participated",
  "Not Participated",
];

const CATEGORIES = [
  "All Categories",
  "Technical",
  "Workshop",
  "Cultural",
  "Sports",
  "Seminar",
  "Other",
];

function getEventDate(event) {
  const value =
    event.startDateTime || event.startDate || event.date || null;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getEventTitle(event) {
  return event.displayTitle || event.title || event.name || "Campus event";
}

function getEventCategory(event) {
  return event.displayCategory || event.category || "Other";
}

function getRegistrationEventId(registration) {
  return (
    registration.eventId ??
    registration.event?.id ??
    registration.event?.eventId ??
    registration.event_id ??
    null
  );
}

function getRegistrationStatus(registration) {
  return String(
    registration.status ||
      registration.attendanceStatus ||
      registration.attendance_status ||
      ""
  ).toUpperCase();
}

function isParticipated(registration) {
  const status = getRegistrationStatus(registration);

  return (
    registration.participated === true ||
    registration.attended === true ||
    ["PARTICIPATED", "ATTENDED", "PRESENT"].includes(status)
  );
}

function EventCard({ event, registered, onOpenEvent, onRegister }) {
  const title = getEventTitle(event);
  const category = getEventCategory(event);
  const date = getEventDate(event);

  const dateLabel =
    event.displayDate ||
    (date
      ? date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Date to be announced");

  const timeLabel =
    event.displayTime ||
    event.time ||
    (date
      ? date.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Time to be announced");

  const location =
    event.displayLocation ||
    event.location ||
    event.venue ||
    (event.online ? "Online event" : "Venue to be announced");

  const image = event.displayImage || event.imageUrl || event.image || "";

  return (
    <article className="events-card">
      <button
        className="events-card-open"
        type="button"
        onClick={() => onOpenEvent?.(event)}
        aria-label={`View details for ${title}`}
      >
        <div className="events-card-image">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <span className="events-card-placeholder" aria-hidden="true">
              {event.icon || "✦"}
            </span>
          )}

          <span className="events-category-badge">{category}</span>
        </div>

        <div className="events-card-body">
          <div className="events-card-date">{dateLabel}</div>
          <h3>{title}</h3>

          <p>
            <span aria-hidden="true">◷</span> {timeLabel}
          </p>

          <p>
            <span aria-hidden="true">⌖</span> {location}
          </p>

          {(event.displayDescription || event.description) && (
            <p className="events-description">
              {event.displayDescription || event.description}
            </p>
          )}
        </div>
      </button>

      <div className="events-card-footer">
        <span className={registered ? "events-status registered" : "events-status"}>
          {registered ? "✓ Registered" : "Open for registration"}
        </span>

        {registered ? (
          <button
            type="button"
            className="events-details-button"
            onClick={() => onOpenEvent?.(event)}
          >
            View details
          </button>
        ) : (
          <button
            type="button"
            className="events-register-button"
            onClick={() => onRegister?.(event)}
          >
            Register →
          </button>
        )}
      </div>
    </article>
  );
}

function Events({
  events = [],
  registrations = [],
  loading = false,
  eventError = "",
  student = null,
  onOpenEvent,
  onRegister,
  setStudentSection = () => {},
openAuth = () => {}
}) {
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("date");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const registeredIds = useMemo(
    () =>
      new Set(
        registrations
          .map(getRegistrationEventId)
          .filter((id) => id != null)
          .map(String)
      ),
    [registrations]
  );

  const registrationByEventId = useMemo(() => {
    const map = new Map();

    registrations.forEach((registration) => {
      const id = getRegistrationEventId(registration);
      if (id != null) map.set(String(id), registration);
    });

    return map;
  }, [registrations]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const result = events.filter((event) => {
      const id = event.id ?? event.eventId;
      const registration =
        id != null ? registrationByEventId.get(String(id)) : null;

      const registered = id != null && registeredIds.has(String(id));
      const participated = registration && isParticipated(registration);
      const date = getEventDate(event);

      const matchesSearch = [
        getEventTitle(event),
        getEventCategory(event),
        event.location,
        event.venue,
        event.displayLocation,
        event.description,
        event.displayDescription,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search.trim().toLowerCase())
        );

      const matchesCategory =
        category === "All Categories" ||
        getEventCategory(event).toLowerCase() === category.toLowerCase();

      let matchesFilter = true;

      switch (activeFilter) {
        case "Upcoming":
          matchesFilter = Boolean(date && date >= now);
          break;

        case "Completed":
          matchesFilter = Boolean(date && date < now);
          break;

        case "Registered":
          matchesFilter = Boolean(registered);
          break;

        case "Participated":
          matchesFilter = Boolean(participated);
          break;

        case "Not Participated":
          matchesFilter = Boolean(
            registered &&
              date &&
              date < now &&
              !participated &&
              registration &&
              ["NOT_PARTICIPATED", "ABSENT", "NOT_ATTENDED"].includes(
                getRegistrationStatus(registration)
              )
          );
          break;

        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesCategory && matchesFilter;
    });

    return [...result].sort((a, b) => {
      const dateA = getEventDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const dateB = getEventDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;

      if (sortBy === "name") {
        return getEventTitle(a).localeCompare(getEventTitle(b));
      }

      if (sortBy === "newest") return dateB - dateA;

      return dateA - dateB;
    });
  }, [
    events,
    registrationByEventId,
    registeredIds,
    activeFilter,
    search,
    category,
    sortBy,
  ]);


  const hasActiveFilters =
    activeFilter !== "All Events" ||
    search.trim() !== "" ||
    category !== "All Categories";

  function resetFilters() {
    setActiveFilter("All Events");
    setSearch("");
    setCategory("All Categories");
  }

  return (
    <div
      className={`events-layout ${sidebarOpen ? "" : "sidebar-collapsed"}`}
    >
      <Sidebar
        studentSection="Explore Events"
        setStudentSection={setStudentSection}
        student={student}
        openAuth={openAuth}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <main className="events-page">
        <header className="events-page-header">
          <div>
            <p className="events-eyebrow">EXPLORE</p>
            <h1>All Events</h1>
            <p className="events-page-subtitle">
              Browse, search and register for events happening on campus.
            </p>
          </div>

          <div className="events-count">
            <strong>{filteredEvents.length}</strong>
            <span>{filteredEvents.length === 1 ? "event" : "events"}</span>
          </div>
        </header>

        <section className="events-controls">
          <div className="events-filter-list">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  activeFilter === item
                    ? "events-filter-button active"
                    : "events-filter-button"
                }
                onClick={() => setActiveFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="events-search-row">
            <label className="events-search">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search events</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, venues or categories..."
              />
              {search && (
                <button
                  type="button"
                  className="events-clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <label className="events-category-select">
              <span className="sr-only">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="events-sort-select">
              <span className="sr-only">Sort events</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Soonest first</option>
                <option value="newest">Latest first</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <div className="events-message">
            <div className="events-spinner" />
            <p>Loading campus events...</p>
          </div>
        ) : eventError ? (
          <div className="events-message events-message-error">
            <h3>Could not load events</h3>
            <p>{eventError}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="events-empty-state">
            <div className="events-empty-icon">✦</div>
            <h2>No events found</h2>
            <p>
              {events.length === 0
                ? "Events will appear here when they are added to CampusConnect."
                : "Try changing your search, category or filter."}
            </p>
            {hasActiveFilters && events.length > 0 && (
              <button
                type="button"
                className="events-reset-button"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event, index) => {
              const id = event.id ?? event.eventId;

              return (
                <EventCard
                  key={id ?? `${getEventTitle(event)}-${index}`}
                  event={event}
                  registered={id != null && registeredIds.has(String(id))}
                  onOpenEvent={onOpenEvent}
                  onRegister={onRegister}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Events;
