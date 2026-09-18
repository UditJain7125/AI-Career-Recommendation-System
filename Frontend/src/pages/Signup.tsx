import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../pages/config";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [education, setEducation] = useState("");
  const [course, setCourse] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/signup`,
        {
          name,
          email,
          password,
          education: education || null,
          course: course || null,
          graduation_year: graduationYear
            ? Number(graduationYear)
            : null,
        }
      );

      alert("Account created successfully!");

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

  return (
    <main className="auth-page">

      <section className="auth-card">

        {/* =========================
            HEADER
        ========================== */}

        <div className="auth-header">

          <h1>
            AI Career Recommendation
          </h1>

          <p>
            Create your profile and discover
            suitable career opportunities.
          </p>

        </div>

        {/* =========================
            FORM
        ========================== */}

        <div className="auth-form">

          <h2>
            Create Account
          </h2>

          <p className="auth-subtitle">
            Enter your details to get started.
          </p>

          <form onSubmit={handleSignup}>

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                required
              />

            </div>

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
                placeholder="Create a password"
                required
              />

            </div>

            {/* EDUCATION */}

            <div className="form-group">

              <label htmlFor="education">
                Education Level
              </label>

              <input
                id="education"
                type="text"
                value={education}
                onChange={(e) =>
                  setEducation(e.target.value)
                }
                placeholder="e.g. Bachelor's"
              />

            </div>

            {/* COURSE */}

            <div className="form-group">

              <label htmlFor="course">
                Course / Branch
              </label>

              <input
                id="course"
                type="text"
                value={course}
                onChange={(e) =>
                  setCourse(e.target.value)
                }
                placeholder="e.g. Computer Science"
              />

            </div>

            {/* GRADUATION YEAR */}

            <div className="form-group">

              <label htmlFor="graduationYear">
                Graduation Year
              </label>

              <input
                id="graduationYear"
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

            {/* ERROR */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* SIGNUP BUTTON */}

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

          {/* LOGIN LINK */}

          <p className="auth-footer">

            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>

      </section>

    </main>
  );
}

export default Signup;