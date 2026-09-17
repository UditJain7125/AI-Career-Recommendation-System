import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        {
          email,
          password,
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

  return (
    <main className="auth-page">

      <section className="auth-card">

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

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

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

          {/* SIGNUP LINK */}

          <p className="auth-footer">

            Don't have an account?{" "}

            <Link to="/signup">
              Create an account
            </Link>

          </p>

        </div>

      </section>

    </main>
  );
}

export default Login;