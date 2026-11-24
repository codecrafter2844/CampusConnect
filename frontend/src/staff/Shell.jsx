// Layout shared by the admin and organizer dashboards.
function Shell({ title, subtitle, nav, section, setSection, user, onLogout, notice, onDismissNotice, children }) {
  return (
    <div className="st-shell">
      <aside className="st-side">
        <a className="st-brand" href="/">
          Campus<span>Connect</span>
        </a>
        <p className="st-side-label">{title}</p>

        <nav>
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`st-nav ${section === item.key ? "active" : ""}`}
              onClick={() => setSection(item.key)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="st-side-foot">
          <div className="st-user">
            <span className="st-avatar">{(user || "?").charAt(0).toUpperCase()}</span>
            <span className="st-user-name">{user}</span>
          </div>
          <button type="button" className="st-ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="st-main">
        <header className="st-header">
          <div>
            <h1>{nav.find((n) => n.key === section)?.label}</h1>
            {subtitle && <p className="st-muted">{subtitle}</p>}
          </div>
        </header>

        {notice && (
          <div className={`st-notice ${notice.type === "error" ? "error" : ""}`} role="status">
            <span>{notice.text}</span>
            <button type="button" onClick={onDismissNotice} aria-label="Dismiss">×</button>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

export default Shell;
