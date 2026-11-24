import "./NotificationsBanner.css";

// Shows unread in-app messages (for example "event cancelled") to a student.
function NotificationsBanner({ notifications = [], onMarkRead = () => {} }) {
  const unread = notifications.filter((item) => !item.seen);

  if (unread.length === 0) return null;

  return (
    <section className="notifications-banner" role="status">
      <div className="notifications-banner-head">
        <strong>
          {unread.length} new notification{unread.length === 1 ? "" : "s"}
        </strong>
        <button type="button" onClick={onMarkRead}>
          Mark all as read
        </button>
      </div>

      <ul>
        {unread.map((item) => (
          <li key={item.id}>
            <span>{item.message}</span>
            <time>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : ""}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default NotificationsBanner;
