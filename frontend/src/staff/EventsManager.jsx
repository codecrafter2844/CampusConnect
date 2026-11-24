import { useState } from "react";
import Modal from "./Modal";
import EventFormModal from "./EventFormModal";
import { formatDate, money } from "./api";

// Table of events with create / edit / delete. Used by admin and organizer.
function EventsManager({ events, loading, organizers, showClub, onCreate, onUpdate, onDelete, onViewRegistrations }) {
  const [editing, setEditing] = useState(null);   // event | "new" | null
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await onDelete(deleting);
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="st-toolbar">
        <p className="st-muted">{events.length} event{events.length === 1 ? "" : "s"}</p>
        <button type="button" className="st-primary" onClick={() => setEditing("new")}>
          + Create event
        </button>
      </div>

      <div className="st-card st-table-wrap">
        {loading ? (
          <p className="st-empty">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="st-empty">No events yet. Create the first one.</p>
        ) : (
          <table className="st-table">
            <thead>
              <tr>
                <th>Event</th>
                {showClub && <th>Hosted by</th>}
                <th>When</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Registered</th>
                <th>Collected</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.title}</strong>
                    <span className="st-sub">{event.category} · {event.location}</span>
                  </td>
                  {showClub && <td>{event.organizerName}</td>}
                  <td>{formatDate(event.date)}<span className="st-sub">{event.time}</span></td>
                  <td>
                    {event.seatsLeft} / {event.seats}
                    {event.seatsLeft === 0 && <span className="st-pill red">Full</span>}
                  </td>
                  <td>{event.price > 0 ? money(event.price) : "Free"}</td>
                  <td>
                    {event.registered}
                    {event.pendingPayment > 0 && <span className="st-sub">{event.pendingPayment} unpaid hold</span>}
                  </td>
                  <td>
                    {event.price > 0 ? money(event.revenue) : "-"}
                    {event.refundPending > 0 && <span className="st-sub warn">{event.refundPending} refund due</span>}
                  </td>
                  <td className="st-row-actions">
                    <button type="button" className="st-link" onClick={() => onViewRegistrations(event)}>Students</button>
                    <button type="button" className="st-link" onClick={() => setEditing(event)}>Edit</button>
                    <button type="button" className="st-link danger" onClick={() => setDeleting(event)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <EventFormModal
          event={editing === "new" ? null : editing}
          organizers={organizers}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            if (editing === "new") await onCreate(payload);
            else await onUpdate(editing.id, payload);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <Modal title="Delete this event?" onClose={() => setDeleting(null)}>
          <p className="st-modal-text"><strong>{deleting.title}</strong></p>
          {deleting.registered + deleting.pendingPayment > 0 ? (
            <p className="st-modal-text">
              {deleting.registered + deleting.pendingPayment} student(s) are registered.
              Their registrations will be cancelled and each student will be notified in the app.
              {deleting.paid > 0 && ` ${deleting.paid} paid registration(s) (${money(deleting.revenue)}) will be marked for refund.`}
            </p>
          ) : (
            <p className="st-modal-text">Nobody has registered yet, so the event will simply be removed.</p>
          )}
          <div className="st-actions">
            <button type="button" className="st-ghost" onClick={() => setDeleting(null)}>Keep event</button>
            <button type="button" className="st-danger" onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? "Deleting..." : "Delete event"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default EventsManager;
