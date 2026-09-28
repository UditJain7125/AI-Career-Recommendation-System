import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../pages/config";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(
    location.pathname === "/login"
  );

  // =========================================
  // SIGNUP STATE
  // =========================================

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [education, setEducation] = useState("");
  const [course, setCourse] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // =========================================
  // LOGIN STATE
  // =========================================

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // =========================================
  // COMMON STATE
  // =========================================

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // KEEP CARD IN SYNC WITH ROUTE
  // =========================================

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    setError("");
  }, [location.pathname]);

  // =========================================
  // SWITCH TO LOGIN
  // =========================================

  const switchToLogin = () => {
    setError("");
    setIsLogin(true);
  };

  // =========================================
  // SWITCH TO SIGNUP
  // =========================================

  const switchToSignup = () => {
    setError("");
    setIsLogin(false);
  };

  // =========================================
  // SIGNUP
  // =========================================

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/signup`,
        {
          name,
          email: signupEmail,
          password: signupPassword,
          education: education || null,
          course: course || null,
          graduation_year: graduationYear
            ? Number(graduationYear)
            : null,
        }
      );

      alert("Account created successfully!");

      // Put the newly registered email into login
      setLoginEmail(signupEmail);
      setLoginPassword("");

      // Show login side
      setIsLogin(true);

      // Update React Router route
      navigate("/login");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Signup failed. Please try again."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        {
          email: loginEmail,
          password: loginPassword,
        }
      );

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      navigate("/dashboard");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Login failed. Please check your details."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <main className="auth-page">

      <div
        className={`auth-flip-container ${
          isLogin ? "auth-flipped" : ""
        }`}
      >

        <div className="auth-flip-card">

          {/* =====================================================
              SIGNUP - FRONT
          ===================================================== */}

          <section className="auth-card auth-flip-front">

            <div className="auth-header">

              <h1>
                AI Career Recommendation
              </h1>

              <p>
                Create your profile and discover
                suitable career opportunities.
              </p>

            </div>

            <div className="auth-form">

              <h2>
                Create Account
              </h2>

              <p className="auth-subtitle">
                Enter your details to get started.
              </p>

              <form onSubmit={handleSignup}>

                {/* Full Name */}

                <div className="form-group">

                  <label htmlFor="signup-name">
                    Full Name
                  </label>

                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                  />

                </div>

                {/* Email */}

                <div className="form-group">

                  <label htmlFor="signup-email">
                    Email
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) =>
                      setSignupEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                  />

                </div>

                {/* Password */}

                <div className="form-group">

                  <label htmlFor="signup-password">
                    Password
                  </label>

                  <input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) =>
                      setSignupPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    required
                  />

                </div>

                {/* Education */}

                <div className="form-group">

                  <label htmlFor="signup-education">
                    Education Level
                  </label>

                  <input
                    id="signup-education"
                    type="text"
                    value={education}
                    onChange={(e) =>
                      setEducation(e.target.value)
                    }
                    placeholder="e.g. Bachelor's"
                  />

                </div>

                {/* Course */}

                <div className="form-group">

                  <label htmlFor="signup-course">
                    Course / Branch
                  </label>

                  <input
                    id="signup-course"
                    type="text"
                    value={course}
                    onChange={(e) =>
                      setCourse(e.target.value)
                    }
                    placeholder="e.g. Computer Science"
                  />

                </div>

                {/* Graduation Year */}

                <div className="form-group">

                  <label htmlFor="signup-year">
                    Graduation Year
                  </label>

                  <input
                    id="signup-year"
                    type="number"
                    value={graduationYear}
                    onChange={(e) =>
                      setGraduationYear(e.target.value)
                    }
                    placeholder="e.g. 2027"
                    min="2000"
                    max="2100"
                  />

                </div>

                {/* Error */}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {/* Signup Button */}

                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>

              </form>

              {/* Switch to Login */}

              <p className="auth-footer">

                Already have an account?{" "}

                <button
                  type="button"
                  className="auth-switch-button"
                  onClick={switchToLogin}
                >
                  Login
                </button>

              </p>

            </div>

          </section>


          {/* =====================================================
              LOGIN - BACK
          ===================================================== */}

          <section className="auth-card auth-flip-back">

            <div className="auth-header">

              <h1>
                AI Career Recommendation
              </h1>

              <p>
                Find careers that match your skills,
                abilities, and interests.
              </p>

            </div>

            <div className="auth-form">

              <h2>
                Welcome Back
              </h2>

              <p className="auth-subtitle">
                Login to continue your career journey.
              </p>

              <form onSubmit={handleLogin}>

                {/* Email */}

                <div className="form-group">

                  <label htmlFor="login-email">
                    Email
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) =>
                      setLoginEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                  />

                </div>

                {/* Password */}

                <div className="form-group">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) =>
                      setLoginPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                  />

                </div>

                {/* Error */}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {/* Login Button */}

                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>

              </form>

              {/* Switch to Signup */}

              <p className="auth-footer">

                Don't have an account?{" "}

                <button
                  type="button"
                  className="auth-switch-button"
                  onClick={switchToSignup}
                >
                  Create an account
                </button>

              </p>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

export default Auth;