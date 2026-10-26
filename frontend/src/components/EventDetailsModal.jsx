
import "./EventDetailsModal.css";

function EventDetailsModal({ event, onClose, onRegister }) {
  if (!event) return null;

  const title = event.displayTitle || event.title || "Campus event";
  const category = event.displayCategory || event.category || "Other";
  const date = event.displayDate || event.date || "Date to be announced";
  const time = event.displayTime || event.time || "Time to be announced";
  const location =
    event.displayLocation || event.location || "Venue to be announced";
  const description =
    event.displayDescription || event.description ||
    "More details about this event will be available soon.";
  const image = event.displayImage || event.imageUrl;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="event-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close event details"
        >
          ×
        </button>

        <div className="event-detail-art">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <span aria-hidden="true">{event.icon || "✦"}</span>
          )}
        </div>

        <div className="event-detail-content">
          <span className="detail-category">{category}</span>
          <h2 id="event-detail-title">{title}</h2>
          <p className="detail-description">{description}</p>

          <div className="detail-info">
            <span aria-hidden="true">◷</span>
            <div>
              <strong>Date and time</strong>
              <p>{date} · {time}</p>
            </div>
          </div>

          <div className="detail-info">
            <span aria-hidden="true">⌖</span>
            <div>
              <strong>Location</strong>
              <p>{location}</p>
            </div>
          </div>

          {event.displaySeats != null && (
            <div className="detail-info">
              <span aria-hidden="true">♧</span>
              <div>
                <strong>Availability</strong>
                <p>{event.displaySeats} seats</p>
              </div>
            </div>
          )}

          <button
            className="detail-register"
            type="button"
            onClick={() => onRegister(event)}
          >
            Register for Event →
          </button>
        </div>
      </section>
    </div>
  );
}

export default EventDetailsModal;
