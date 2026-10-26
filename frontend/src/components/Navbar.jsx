
import "./Navbar.css";

function Navbar({
  student,
  studentSection,
  openAuth,
  setStudentSection,
  handleLogout,
}) {
  return (
    <header className="public-header">
      <a className="brand public-brand" href="#home">
        <span className="brand-icon">C</span>
        <span>
          Campus<span className="brand-light">Connect</span>
        </span>
      </a>

      <nav className="public-nav">
        <a href="#home">Home</a>
        <a href="#events">Explore Events</a>
      </nav>

      <div className="header-actions">
        {student ? (
          <>
            <button
              className={`header-nav-button ${
                studentSection === "My Registrations" ? "active" : ""
              }`}
              onClick={() => setStudentSection("My Registrations")}
            >
              My Registrations
            </button>

            <button
              className={`header-nav-button ${
                studentSection === "Profile" ? "active" : ""
              }`}
              onClick={() => setStudentSection("Profile")}
            >
              Profile
            </button>

            <button className="header-login" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="header-login"
              onClick={() => openAuth("login")}
            >
              Log in
            </button>

            <button
              className="header-signup"
              onClick={() => openAuth("signup")}
            >
              Get Started <span>↗</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
