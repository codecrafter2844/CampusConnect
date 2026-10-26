
import "./LoginModal.css";

function LoginModal({
  authMode,
  setAuthMode,
  onClose,
  onLogin,
  onSignup,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  authLoading,
  authError,
  authMessage,
}) {
  const isSignup = authMode === "signup";

  function handleSubmit(event) {
    event.preventDefault();

    if (isSignup) {
      onSignup();
    } else {
      onLogin();
    }
  }

  return (
    <div
      className="modal-backdrop auth-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
        >
          ×
        </button>

        <div className="auth-modal-brand">
          <a className="brand" href="#home">
            
            <span>
              Campus<span className="brand-light">Connect</span>
            </span>
          </a>
        </div>

        <div className="auth-card-heading">
          <p className="eyebrow">YOUR CAMPUS COMMUNITY</p>
          <h2 id="auth-title">
            {isSignup ? "Create your account" : "Welcome back!"}
          </h2>
          <p>
            {isSignup
              ? "Join your campus community and discover exciting events."
              : "Log in to register for events and manage your registrations."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isSignup ? "active" : ""}`}
            onClick={() => setAuthMode("login")}
          >
            Log in
          </button>

          <button
            type="button"
            className={`auth-tab ${isSignup ? "active" : ""}`}
            onClick={() => setAuthMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </label>

          {isSignup && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {authMessage && (
            <p className="auth-success" role="status">
              {authMessage}
            </p>
          )}

          {authError && (
            <p className="auth-error" role="alert">
              {authError}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait..."
              : isSignup
                ? "Create Account →"
                : "Log In →"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to CampusConnect?"}{" "}
          <button
            type="button"
            onClick={() => setAuthMode(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Log in" : "Create an account"}
          </button>
        </p>

        <p className="auth-note">
          By continuing, you agree to use CampusConnect responsibly.
        </p>
      </section>
    </div>
  );
}

export default LoginModal;
