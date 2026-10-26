import "./Sidebar.css";

function Icon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "events":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "registrations":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      );
    case "collapse":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
          <path d="m16 10-2 2 2 2" />
        </svg>
      );
    case "expand":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
          <path d="m14 10 2 2-2 2" />
        </svg>
      );
    default:
      return null;
  }
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", section: "Dashboard" },
  { label: "All Events", icon: "events", section: "Explore Events" },
  { label: "My Registrations", icon: "registrations", section: "My Registrations" },
  { label: "Profile", icon: "profile", section: "Profile" },
];

function Sidebar({
  studentSection = "Dashboard",
  setStudentSection = () => {},
  student = null,
  openAuth = () => {},
  isOpen = true,
  onToggle = () => {},
}) {
  function goToSection(section) {
    if (
      (section === "My Registrations" || section === "Profile") &&
      !student
    ) {
      openAuth("login");
      return;
    }

    setStudentSection(section);
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="sidebar-reopen-button"
          onClick={onToggle}
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <Icon name="expand" />
        </button>
      )}

      {isOpen && (
        <aside className="campus-sidebar">
          <div className="campus-sidebar-brand-row">
            <a
              href="#dashboard"
              className="campus-sidebar-brand"
              onClick={() => setStudentSection("Dashboard")}
            >
              Campus<span>Connect</span>
            </a>

            <button
              type="button"
              className="sidebar-close-button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Icon name="collapse" />
            </button>
          </div>

          <p className="campus-sidebar-label">WORKSPACE</p>

          <nav className="campus-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                type="button"
                className={`campus-sidebar-link ${
                  studentSection === item.section ? "active" : ""
                }`}
                onClick={() => goToSection(item.section)}
              >
                <span className="campus-sidebar-icon" aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="campus-sidebar-help">
            <span className="campus-sidebar-help-icon">?</span>
            <div>
              <strong>Need help?</strong>
              <p>We're here for you.</p>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export default Sidebar;
