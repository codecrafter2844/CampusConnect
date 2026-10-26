
import "./EventCard.css";

function EventCard({ event, onOpen, onRegister }) {
  const eventTitle = event.displayTitle || event.title || "Campus event";
  const category = event.displayCategory || event.category || "Other";
  const date = event.displayDate || event.date || "Date to be announced";
  const time = event.displayTime || event.time || "Time to be announced";
  const location =
    event.displayLocation || event.location || "Venue to be announced";

  return (
    <article className="event-card">
      <button
        className="event-card-open"
        type="button"
        onClick={() => onOpen(event)}
        aria-label={`View details for ${eventTitle}`}
      >
        <div className="event-art event-art-large">
          <span className="event-category">{category}</span>

          {event.displayImage || event.imageUrl ? (
            <img
              className="event-card-image"
              src={event.displayImage || event.imageUrl}
              alt={eventTitle}
            />
          ) : (
            <span className="event-emoji" aria-hidden="true">
              {event.icon || "✦"}
            </span>
          )}

          <span className="placeholder-caption">CAMPUSCONNECT EVENTS</span>
        </div>

        <div className="event-details">
          <div className="event-card-meta">
            <span>{date}</span>
            <span>{category}</span>
          </div>

          <h3>{eventTitle}</h3>

          <p className="event-info">◷ {time}</p>
          <p className="event-info">⌖ {location}</p>

          {event.displayDescription && (
            <p className="event-description-preview">
              {event.displayDescription}
            </p>
          )}
        </div>
      </button>

      <div className="event-footer">
        <span className="seats">
          {event.displaySeats != null
            ? `${event.displaySeats} seats`
            : "Join the event"}
        </span>

        <div className="event-actions">
          <button
            className="view-details-button"
            type="button"
            onClick={() => onOpen(event)}
          >
            View details
          </button>

          <button
            className="register-button"
            type="button"
            onClick={() => onRegister(event)}
          >
            Register →
          </button>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
