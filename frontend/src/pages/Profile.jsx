import { useState } from "react";
import "./Profile.css";
import Sidebar from "../components/Sidebar";

function Profile({
  student,
  onLogout,
  setStudentSection = () => {},
  openAuth = () => {},
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const name = student?.name || "Campus Student";
  const email = student?.email || "Email not available";

  return (
    <div
      className={`profile-layout ${sidebarOpen ? "" : "sidebar-collapsed"}`}
    >
      <Sidebar
        studentSection="Profile"
        setStudentSection={setStudentSection}
        student={student}
        openAuth={openAuth}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <main className="profile-page">
        {!student ? (
          <div className="profile-empty">
            <h2>Profile not available</h2>
            <p>Please log in to view your profile.</p>
          </div>
        ) : (
          <>
            <section className="profile-heading">
              <span className="profile-eyebrow">YOUR ACCOUNT</span>
              <h1>My Profile</h1>
              <p>Manage your CampusConnect account details.</p>
            </section>

            <section className="profile-card">
              <div className="profile-avatar" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </div>

              <div className="profile-information">
                <h2>{name}</h2>
                <p>{email}</p>
                <span className="profile-role">Student Account</span>
              </div>

              <div className="profile-details">
                <div className="profile-detail-row">
                  <span>Full Name</span>
                  <strong>{name}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Email Address</span>
                  <strong>{email}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Account Type</span>
                  <strong>Student</strong>
                </div>
              </div>

              <button
                className="profile-logout-button"
                type="button"
                onClick={onLogout}
              >
                Log Out
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
