
import "./WelcomeScreen.css";

function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-orbit welcome-orbit-one" />
      <div className="welcome-orbit welcome-orbit-two" />

      <div className="welcome-content">
        <div className="welcome-logo">
          <span>C</span>
          <i>✦</i>
        </div>

        <h1>
          Campus<span>Connect</span>
        </h1>

        <p>Your campus. Your community. Your next big moment.</p>

        <div className="welcome-loader">
          <span />
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
