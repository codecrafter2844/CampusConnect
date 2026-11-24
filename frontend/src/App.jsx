
import { useState, useEffect } from "react";
import "./index.css";
import "./App.css";

import LoginModal from "./components/LoginModal";
import EventDetailsModal from "./components/EventDetailsModal";

import Home from "./pages/Home";
import MyRegistrations from "./pages/MyRegistrations";
import Profile from "./pages/Profile";
import Events from "./pages/Events";

const API = "http://localhost:8080";

// Loads Razorpay's checkout script once, only when a payment is needed.
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () =>
      reject(new Error("Could not load the payment window. Check your internet connection."));
    document.body.appendChild(script);
  });
}

function readEvent(event) {
  const start = event.startDateTime || event.startDate || event.date;

  const dateLabel = start
    ? new Date(start).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Date to be announced";

  return {
    ...event,
    displayTitle: event.title || event.name || "Campus event",
    displayCategory: event.category || "Other",
    displayDate: event.displayDate || dateLabel,
    displayTime:
      event.time ||
      (start
        ? new Date(start).toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        })
        : "Time to be announced"),
    displayLocation:
      event.location ||
      event.venue ||
      (event.online ? "Online event" : "Venue to be announced"),
    displayDescription:
      event.description ||
      "More details about this event will be available soon.",
    displayPrice: Number(event.price || 0),
    displaySeats: event.seatsLeft ?? event.seats ?? event.capacity ?? null,
    soldOut: event.seatsLeft != null && event.seatsLeft <= 0,
    displayClub: event.organizerName || "",
    displayImage: event.imageUrl || event.coverImageUrl || event.image || "",
  };
}

async function readResponse(response) {
  const body = await response.text();

  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function getErrorMessage(data, fallback) {
  if (typeof data === "string" && data.trim()) return data;

  return data?.detail || data?.message || data?.error || fallback;
}

function App() {
  const [introFinished, setIntroFinished] = useState(false);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Events");

  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(false);

  const [token, setToken] = useState("");
  const [student, setStudent] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [studentSection, setStudentSection] = useState("Dashboard");

  const [notice, setNotice] = useState("");

  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);

  // Load public events.
  useEffect(() => {
    let active = true;

    async function fetchEvents() {
      setLoading(true);
      setEventError("");

      try {
        const response = await fetch(`${API}/api/events`);
        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Could not load campus events.")
          );
        }

        if (active) {
          setEvents(Array.isArray(data) ? data.map(readEvent) : []);
        }
      } catch (error) {
        if (active) {
          setEventError(
            error.message ||
            "Events could not be loaded. Check whether the backend is running."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchEvents();

    return () => {
      active = false;
    };
  }, []);

  // Load registrations for the signed-in student.
  useEffect(() => {
    if (!token || !student) {
      setRegistrations([]);
      setRegistrationsError("");
      return;
    }

    let active = true;

    async function fetchRegistrations() {
      setRegistrationsLoading(true);
      setRegistrationsError("");

      try {
        const response = await fetch(`${API}/api/registrations/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Could not load your registrations.")
          );
        }

        if (active) {
          const items = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : [];

          setRegistrations(items);
        }
      } catch (error) {
        if (active) {
          setRegistrationsError(
            error.message || "Could not load your registrations."
          );
        }
      } finally {
        if (active) setRegistrationsLoading(false);
      }
    }

    fetchRegistrations();

    return () => {
      active = false;
    };
  }, [token, student]);

  // Reload events so seat counts stay correct after a registration.
  async function reloadEvents() {
    try {
      const response = await fetch(`${API}/api/events`);
      const data = await readResponse(response);
      if (response.ok && Array.isArray(data)) {
        setEvents(data.map(readEvent));
      }
    } catch {
      // keep showing the events we already have
    }
  }

  async function reloadRegistrations(activeToken = token) {
    if (!activeToken) return;

    try {
      const response = await fetch(`${API}/api/registrations/my`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await readResponse(response);

      if (response.ok) {
        setRegistrations(Array.isArray(data) ? data : []);
        setRegistrationsError("");
      }
    } catch {
      // ignore, the page already shows the last known list
    }
  }

  async function loadNotifications(activeToken = token) {
    if (!activeToken) return 0;

    try {
      const response = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await readResponse(response);

      if (response.ok && Array.isArray(data?.items)) {
        setNotifications(data.items);
        return data.unread || 0;
      }
    } catch {
      // notifications are optional, never block the dashboard
    }

    return 0;
  }

  async function markNotificationsRead() {
    if (!token) return;

    setNotifications((items) => items.map((n) => ({ ...n, seen: true })));

    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore
    }
  }

  // Opens Razorpay checkout for a registration that is waiting for payment.
  async function startPayment(registrationId, eventTitle) {
    setNotice("");

    try {
      const orderResponse = await fetch(
        `${API}/api/payments/${registrationId}/order`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const order = await readResponse(orderResponse);

      if (!orderResponse.ok) {
        throw new Error(
          getErrorMessage(order, "Could not start the payment.")
        );
      }

      const Razorpay = await loadRazorpay();

      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CampusConnect",
        description: eventTitle || order.eventTitle,
        order_id: order.orderId,
        prefill: { name: order.studentName, email: order.studentEmail },
        theme: { color: "#6855e8" },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch(
              `${API}/api/payments/${registrationId}/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpayOrderId: payment.razorpay_order_id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature,
                }),
              }
            );

            const verified = await readResponse(verifyResponse);

            if (!verifyResponse.ok) {
              throw new Error(
                getErrorMessage(verified, "Payment could not be verified.")
              );
            }

            setNotice(
              `Payment successful. You are registered for ${eventTitle || order.eventTitle}!`
            );
          } catch (error) {
            setNotice(error.message || "Payment could not be verified.");
          }

          await reloadRegistrations();
          await reloadEvents();
        },
        modal: {
          ondismiss: () => {
            setNotice(
              "Payment not completed. Your seat is held for 30 minutes - finish paying from My Registrations."
            );
          },
        },
      });

      checkout.on("payment.failed", (failure) => {
        setNotice(
          failure?.error?.description ||
          "Payment failed. You can try again from My Registrations."
        );
      });

      checkout.open();
    } catch (error) {
      setNotice(error.message || "Could not start the payment.");
    }
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setAuthError("");
    setAuthMessage("");
    setPassword("");
    setConfirmPassword("");
    setShowAuth(true);
  }

  function switchAuthMode(mode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  // Student signup.
  async function handleSignup() {
    setAuthError("");
    setAuthMessage("");

    if (!name.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setAuthError("Password must be between 8 and 72 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Signup failed. Please try again.")
        );
      }

      setAuthMode("login");
      setPassword("");
      setConfirmPassword("");
      setAuthMessage("Account created successfully. Please log in.");
    } catch (error) {
      setAuthError(
        error.message || "Could not connect to the server. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // Student login.
  async function handleLogin() {
    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Invalid email or password.")
        );
      }

      if (!data?.token) {
        throw new Error(
          "Login response did not contain an authentication token."
        );
      }

      const profileResponse = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profile = await readResponse(profileResponse);

      if (!profileResponse.ok) {
        throw new Error(
          getErrorMessage(profile, "Could not verify your login.")
        );
      }

      setToken(data.token);
      setStudent(profile);

      setPassword("");
      setConfirmPassword("");
      setShowAuth(false);

      setAuthError("");
      setAuthMessage("");
      setStudentSection("Dashboard");

      const unread = await loadNotifications(data.token);
      setNotice(
        unread > 0
          ? `Welcome back, ${profile.name || "student"}! You have ${unread} new notification${unread === 1 ? "" : "s"}.`
          : `Welcome back, ${profile.name || "student"}!`
      );
    } catch (error) {
      setAuthError(
        error.message || "Could not connect to the server. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setStudent(null);

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setRegistrations([]);
    setNotifications([]);
    setStudentSection("Dashboard");

    setSelectedEvent(null);
    setShowAuth(false);

    setNotice("You have been logged out.");
  }

  // Register a signed-in student for an event.
  async function handleRegister(eventItem) {
    if (!token || !student) {
      setSelectedEvent(null);
      openAuth("login");
      setAuthMessage(
        "Log in or create an account to register for this event."
      );
      return;
    }

    if (!eventItem?.id) {
      setNotice("This event does not have a valid event ID.");
      return;
    }

    setRegistrationLoading(true);
    setNotice("");

    try {
      const response = await fetch(
        `${API}/api/registrations/${eventItem.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not register for this event.")
        );
      }

      setSelectedEvent(null);
      setStudentSection("My Registrations");

      const title = eventItem.displayTitle || eventItem.title;

      if (data?.requiresPayment) {
        setNotice(`Seat held for ${title}. Complete the payment to confirm.`);
        await reloadRegistrations();
        await reloadEvents();
        await startPayment(data.registrationId, title);
        return;
      }

      setNotice(`Successfully registered for ${title}!`);

      await reloadRegistrations();
      await reloadEvents();
    } catch (error) {
      setNotice(
        error.message || "Could not register. Please try again."
      );
    } finally {
      setRegistrationLoading(false);
    }
  }

  // Show the intro video before the dashboard.
  if (!introFinished) {
    return (
      <div className="intro-video-screen">
        <video
          className="intro-video"
          autoPlay
          muted
          playsInline
          onEnded={() => setIntroFinished(true)}
          onError={() => setIntroFinished(true)}
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="public-app app-shell">
      {notice && (
        <div className="notice-banner" role="status">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="app-main">
        {studentSection === "Dashboard" && (
          <Home
            events={events}
            loading={loading}
            eventError={eventError}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            onOpenEvent={setSelectedEvent}
            onRegister={handleRegister}
            student={student}
            openAuth={openAuth}
            setStudentSection={setStudentSection}
            studentSection={studentSection}
          />
        )}

        {studentSection === "Explore Events" && (
          <Events
            events={events}
            registrations={registrations}
            loading={loading}
            eventError={eventError}
            student={student}
            onOpenEvent={setSelectedEvent}
            onRegister={handleRegister}
            setStudentSection={setStudentSection}
            openAuth={openAuth}
          />
        )}

        {student && studentSection === "My Registrations" && (
          <MyRegistrations
            registrations={registrations}
            loading={registrationsLoading || registrationLoading}
            error={registrationsError}
            notifications={notifications}
            onMarkNotificationsRead={markNotificationsRead}
            onPay={(registration) =>
              startPayment(registration.registrationId, registration.title)
            }
            student={student}
            setStudentSection={setStudentSection}
            openAuth={openAuth}
            onExploreEvents={() => setStudentSection("Explore Events")}
          />
        )}

        {student && studentSection === "Profile" && (
          <Profile
            student={student}
            onLogout={handleLogout}
              setStudentSection={setStudentSection}
  openAuth={openAuth}
          />
        )}
      </div>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
        />
      )}

      {showAuth && (
        <LoginModal
          authMode={authMode}
          setAuthMode={switchAuthMode}
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          authLoading={authLoading}
          authError={authError}
          authMessage={authMessage}
        />
      )}
    </div>
  );
}

export default App;
