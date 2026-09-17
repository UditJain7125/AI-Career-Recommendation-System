import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="home-navbar">

        <div className="home-logo">
          AI Career Recommendation
        </div>

       <div className="home-nav-buttons">

  <button
    className="home-nav-link"
    onClick={() =>
      document.getElementById("about")?.scrollIntoView({
        behavior: "smooth",
      })
    }
  >
    About Us
  </button>

  <button
    className="home-nav-link"
    onClick={() =>
      document.getElementById("contact")?.scrollIntoView({
        behavior: "smooth",
      })
    }
  >
    Contact
  </button>

  <button
    className="home-login-button"
    onClick={() => navigate("/login")}
  >
    Login
  </button>

  <button
    className="home-signup-button"
    onClick={() => navigate("/signup")}
  >
    Sign Up
  </button>

</div>

      </nav>


      {/* HERO SECTION */}
      <section className="home-hero">

        <div className="home-hero-content">

          <p className="home-label">
            PERSONALIZED CAREER GUIDANCE
          </p>

          <h1>
            Find a Career That
            <span> Fits You</span>
          </h1>

          <p className="home-description">
            Discover career options based on your skills,
            abilities, and interests with personalized
            career recommendations and AI-powered insights.
          </p>

          <div className="home-hero-buttons">

            <button
              className="home-primary-button"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>

            <button
              className="home-secondary-button"
              onClick={() => navigate("/login")}
            >
              Already have an account?
            </button>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="home-section">

        <div className="home-section-header">

          <p className="home-label">
            SIMPLE PROCESS
          </p>

          <h2>
            How It Works
          </h2>

          <p>
            Get personalized career recommendations
            in three simple steps.
          </p>

        </div>


        <div className="home-steps">

          <div className="home-step-card">

            <div className="home-step-number">
              01
            </div>

            <h3>
              Assess
            </h3>

            <p>
              Answer questions about your skills,
              abilities, and interests.
            </p>

          </div>


          <div className="home-step-card">

            <div className="home-step-number">
              02
            </div>

            <h3>
              Analyze
            </h3>

            <p>
              Your profile is compared with
              career profiles using machine learning.
            </p>

          </div>


          <div className="home-step-card">

            <div className="home-step-number">
              03
            </div>

            <h3>
              Discover
            </h3>

            <p>
              Get your top career matches with
              personalized AI insights.
            </p>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="home-features-section">

        <div className="home-section-header">

          <p className="home-label">
            WHAT YOU GET
          </p>

          <h2>
            Personalized Career Insights
          </h2>

        </div>


        <div className="home-features">

          <div className="home-feature-card">
            <span>✓</span>
            <p>Top 5 Career Recommendations</p>
          </div>

          <div className="home-feature-card">
            <span>✓</span>
            <p>Personalized Career Explanations</p>
          </div>

          <div className="home-feature-card">
            <span>✓</span>
            <p>Skills to Improve</p>
          </div>

          <div className="home-feature-card">
            <span>✓</span>
            <p>Personalized Learning Roadmap</p>
          </div>

        </div>

      </section>

{/* ABOUT US */}
<section
  id="about"
  className="home-about-section"
>

  <div className="home-section-header">

    <p className="home-label">
      ABOUT US
    </p>

    <h2>
      Helping Students Explore Their Career Options
    </h2>

  </div>

  <div className="home-about-content">

    <p>
      AI Career Recommendation System is designed to help
      students explore career options based on their
      skills, abilities, and interests.
    </p>

    <p>
      The system analyzes assessment responses and compares
      them with occupational profiles to provide personalized
      career recommendations, AI-powered insights, and a
      learning roadmap.
    </p>

  </div>

</section>

{/* CONTACT */}
<section
  id="contact"
  className="home-contact-section"
>

  <div className="home-section-header">

    <p className="home-label">
      CONTACT
    </p>

    <h2>
      Get in Touch
    </h2>

    <p>
      Have questions or feedback about the project?
      We'd love to hear from you.
    </p>

  </div>

  <div className="home-contact-card">

    <div className="home-contact-item">

      <span>
        ✉️
      </span>

      <div>
        <strong>
          Email
        </strong>

        <p>
          Udit@example.com
        </p>
      </div>

    </div>

    <div className="home-contact-item">

      <span>
        💻
      </span>

      <div>
        <strong>
          Project
        </strong>

        <p>
          AI Career Recommendation System
        </p>
      </div>

    </div>

  </div>

</section>

      {/* FINAL CTA */}
      <section className="home-cta">

        <h2>
          Start Exploring Your Career Options
        </h2>

        <p>
          Take the assessment and discover careers
          that match your profile.
        </p>

        <button
          className="home-primary-button"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>

      </section>


      {/* FOOTER */}
      <footer className="home-footer">

        <p>
          AI Career Recommendation System
        </p>

        <span>
          Personalized career guidance powered by data and AI
        </span>

      </footer>

    </div>
  );
}

export default Home;