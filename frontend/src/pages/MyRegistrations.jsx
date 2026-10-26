import "./MyRegistrations.css";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function MyRegistrations({
  registrations = [],
  loading = false,
  error = "",
  onExploreEvents,
  student,
  setStudentSection,
  openAuth,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
     <div
    className={`registrations-layout ${
      sidebarOpen ? "" : "sidebar-collapsed"
    }`}
  >
    <Sidebar
      studentSection="My Registrations"
      setStudentSection={setStudentSection}
      student={student}
      openAuth={openAuth}
      isOpen={sidebarOpen}
      onToggle={() => setSidebarOpen((open) => !open)}
    />
    <main className="my-registrations-page">
      <section className="registrations-heading">
        <p className="eyebrow">YOUR CAMPUS JOURNEY</p>
        <h1>My Registrations</h1>
        <p>
          Keep track of the campus events you have signed up for.
        </p>
      </section>

      {loading ? (
        <div className="registrations-state">
          Loading your registrations...
        </div>
      ) : error ? (
        <div className="registrations-state registrations-error">
          {error}
        </div>
      ) : registrations.length === 0 ? (
        <section className="registrations-empty">
          <div className="registrations-empty-icon">✦</div>
          <h2>No registrations yet</h2>
          <p>
            You haven't registered for any events yet. Explore campus events
            and find something you would love to participate in.
          </p>
          <button
            className="registrations-explore-button"
            type="button"
            onClick={onExploreEvents}
          >
            Explore Events →
          </button>
        </section>
      ) : (
        <section className="registrations-list">
          <div className="registrations-list-heading">
            <h2>Your registered events</h2>
            <span>{registrations.length} total</span>
          </div>

          {registrations.map((registration) => {
            const event = registration.event || registration;
            const title =
              event.displayTitle || event.title || event.name || "Campus event";
            const date =
              event.displayDate || event.date || event.startDate || "Date to be announced";
            const location =
              event.displayLocation || event.location || event.venue || "Venue to be announced";

            return (
              <article
                className="registration-row"
                key={registration.id ?? event.id ?? title}
              >
                <div className="registration-row-icon">✦</div>

                <div className="registration-row-content">
                  <h3>{title}</h3>
                  <p>{date} · {location}</p>
                </div>

                <span className="registration-status">
                  {registration.status || "Confirmed"}
                </span>
              </article>
            );
          })}
        </section>
      )}
    </main>
    </div>
  );
}

export default MyRegistrations;
