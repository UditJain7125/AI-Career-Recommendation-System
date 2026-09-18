import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { API_BASE_URL } from "../pages/config";

interface Profile {
  id: number;
  name: string;
  email: string;
  education?: string;
  course?: string;
  graduation_year?: number;
  profile_image?: string | null;
}

interface Recommendation {
  career: string;
  occupation_code: string;
  similarity_score: number;
  description: string;
}

interface AssessmentHistory {
  assessment_id: number;
  recommendations: Recommendation[];
}

interface HistoryResponse {
  user_id: number;
  total_assessments: number;
  total_recommendations?: number;
  history: AssessmentHistory[];
}

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [history, setHistory] =
    useState<HistoryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, historyResponse] =
          await Promise.all([
            axios.get(
              `${API_BASE_URL}/profile`,
              { headers }
            ),

            axios.get(
              `${API_BASE_URL}/history`,
              { headers }
            ),
          ]);

        setProfile(profileResponse.data);
        setHistory(historyResponse.data);

      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          setError(
            err.response?.data?.detail ||
              "Unable to load dashboard."
          );
        } else {
          setError(
            "Something went wrong while loading the dashboard."
          );
        }

      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="dashboard-content">
            <div className="dashboard-loading">
              <div className="loading-spinner">
                ⟳
              </div>

              <h2>
                Loading dashboard...
              </h2>

              <p>
                Please wait while we load your
                career information.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="dashboard-content">
            <div className="dashboard-error-card">
              <h2>
                Unable to load dashboard
              </h2>

              <p>{error}</p>

              <button
                className="dashboard-primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalAssessments =
    history?.total_assessments ?? 0;

  const totalRecommendations =
    history?.total_recommendations ??
    history?.history.reduce(
      (total, assessment) =>
        total +
        assessment.recommendations.length,
      0
    ) ??
    0;

  const latestAssessment =
    history?.history?.[0];

  const bestMatch =
    latestAssessment?.recommendations?.[0];

  const recentRecommendations =
    latestAssessment?.recommendations?.slice(
      0,
      3
    ) ?? [];

  // Profile photo URL
  const profileImageUrl = profile?.profile_image
    ? `${API_BASE_URL}/${profile.profile_image}`
    : null;

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="dashboard-content">

          {/* Welcome */}

          <section className="welcome-section">

            <div>
              <p className="welcome-label">
                WELCOME BACK
              </p>

              <h1>
                Hello, {profile?.name || "there"} 👋
              </h1>

              <p>
                Continue your career journey and
                discover opportunities that match
                your strengths.
              </p>
            </div>

            <button
              className="dashboard-primary-button"
              onClick={() =>
                navigate("/assessment")
              }
            >
              Take Assessment →
            </button>

          </section>

          {/* Statistics */}

          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon">
                ✓
              </div>

              <div>
                <span>
                  Total Assessments
                </span>

                <strong>
                  {totalAssessments}
                </strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon">
                ★
              </div>

              <div>
                <span>
                  Recommendations
                </span>

                <strong>
                  {totalRecommendations}
                </strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon">
                🎯
              </div>

              <div>
                <span>
                  Best Match
                </span>

                <strong>
                  {bestMatch
                    ? `${(
                        bestMatch
                          .similarity_score *
                        100
                      ).toFixed(0)}%`
                    : "--"}
                </strong>
              </div>

            </div>

          </section>

          {/* Main Columns */}

          <div className="dashboard-columns">

            {/* Assessment Panel */}

            <section className="dashboard-panel">

              <div className="panel-header">
                <div>
                  <h2>
                    Career Assessment
                  </h2>

                  <p>
                    Find careers that match your
                    skills, abilities, and interests.
                  </p>
                </div>

                <span className="panel-icon">
                  🎯
                </span>
              </div>

              <div className="assessment-info">

                <div>
                  <strong>
                    68
                  </strong>

                  <span>
                    Questions
                  </span>
                </div>

                <div>
                  <strong>
                    5
                  </strong>

                  <span>
                    Career Matches
                  </span>
                </div>

                <div>
                  <strong>
                    AI
                  </strong>

                  <span>
                    Insights
                  </span>
                </div>

              </div>

              <button
                className="dashboard-primary-button"
                onClick={() =>
                  navigate("/assessment")
                }
              >
                Start Assessment →
              </button>

            </section>

            {/* Profile Panel */}

            <section className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h2>
                    Your Profile
                  </h2>

                  <p>
                    Your account information.
                  </p>
                </div>

                {/* Profile Photo */}
                <div className="large-avatar">

                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={
                        profile?.name ||
                        "Profile"
                      }
                      className="large-avatar-image"
                    />
                  ) : (
                    "👤"
                  )}

                </div>

              </div>

              <div className="profile-details">

                <div>
                  <span>
                    Name
                  </span>

                  <strong>
                    {profile?.name || "--"}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {profile?.email || "--"}
                  </strong>
                </div>

                <div>
                  <span>
                    Education
                  </span>

                  <strong>
                    {profile?.education || "--"}
                  </strong>
                </div>

                <div>
                  <span>
                    Course / Branch
                  </span>

                  <strong>
                    {profile?.course || "--"}
                  </strong>
                </div>

              </div>

            </section>

          </div>

          {/* Recent Recommendations */}

          <section className="recent-section">

            <div className="section-title">

              <div>
                <h2>
                  Recent Recommendations
                </h2>

                <p>
                  Your latest career matches.
                </p>
              </div>

              {recentRecommendations.length >
                0 && (
                <button
                  className="dashboard-secondary-button"
                  onClick={() =>
                    navigate("/history")
                  }
                >
                  View History
                </button>
              )}

            </div>

            {recentRecommendations.length ===
            0 ? (

              <div className="empty-recommendation">

                <div className="empty-icon">
                  📋
                </div>

                <h3>
                  No recommendations yet
                </h3>

                <p>
                  Complete your first assessment
                  to discover suitable career paths.
                </p>

                <button
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate("/assessment")
                  }
                >
                  Take Your First Assessment →
                </button>

              </div>

            ) : (

              <div className="recent-recommendation-grid">

                {recentRecommendations.map(
                  (recommendation, index) => {

                    const percentage =
                      recommendation.similarity_score *
                      100;

                    return (
                      <article
                        className="recent-recommendation-card"
                        key={
                          recommendation.occupation_code
                        }
                      >

                        <div className="recent-card-top">

                          <div className="recent-rank">
                            {index + 1}
                          </div>

                          <strong>
                            {percentage.toFixed(0)}%
                          </strong>

                        </div>

                        <h3>
                          {recommendation.career}
                        </h3>

                        <div className="recent-match-bar">
                          <div
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <p>
                          {recommendation.description}
                        </p>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;