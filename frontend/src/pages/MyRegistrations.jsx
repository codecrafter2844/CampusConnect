import "./MyRegistrations.css";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import NotificationsBanner from "../components/NotificationsBanner";

const STATUS_LABELS = {
  CONFIRMED: "Confirmed",
  PENDING_PAYMENT: "Payment pending",
  CANCELLED: "Cancelled",
};

const PAYMENT_LABELS = {
  PAID: "Paid",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
};

function MyRegistrations({
  registrations = [],
  loading = false,
  error = "",
  onExploreEvents,
  student,
  setStudentSection,
  openAuth,
  onPay = () => {},
  notifications = [],
  onMarkNotificationsRead = () => {},
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

      <NotificationsBanner
        notifications={notifications}
        onMarkRead={onMarkNotificationsRead}
      />

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

            const status = String(registration.status || "CONFIRMED").toUpperCase();
            const payment = String(registration.paymentStatus || "").toUpperCase();
            const amount = Number(registration.amount || 0);

            return (
              <article
                className={`registration-row ${status === "CANCELLED" ? "is-cancelled" : ""}`}
                key={registration.registrationId ?? registration.id ?? event.id ?? title}
              >
                <div className="registration-row-icon">✦</div>

                <div className="registration-row-content">
                  <h3>{title}</h3>
                  <p>{date} · {location}</p>

                  {amount > 0 && (
                    <p>
                      ₹{amount}
                      {PAYMENT_LABELS[payment] ? ` · ${PAYMENT_LABELS[payment]}` : ""}
                    </p>
                  )}

                  {status === "CANCELLED" && registration.cancelReason && (
                    <p className="registration-cancel-reason">
                      {registration.cancelReason}
                    </p>
                  )}
                </div>

                {status === "PENDING_PAYMENT" && (
                  <button
                    type="button"
                    className="registration-pay-button"
                    onClick={() => onPay(registration)}
                  >
                    Pay ₹{amount} →
                  </button>
                )}

                <span className={`registration-status status-${status.toLowerCase()}`}>
                  {STATUS_LABELS[status] || status}
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
