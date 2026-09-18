import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { API_BASE_URL } from "../pages/config";

interface LearningStep {
  step: number;
  title: string;
  description: string;
}

interface AIExplanation {
  career?: string;
  why_suitable?: string[];
  important_skills?: string[];
  skills_to_improve?: string[];
  learning_roadmap?: LearningStep[];
}

interface Recommendation {
  career: string;
  occupation_code: string;
  similarity_score: number;
  description: string;
  ai_explanation?: AIExplanation;
}

interface AssessmentHistory {
  assessment_id: number;
  recommendations: Recommendation[];
}

interface HistoryResponse {
  user_id: number;
  total_assessments: number;
  total_recommendations: number;
  history: AssessmentHistory[];
}

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [totalRecommendations, setTotalRecommendations] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedCareer, setExpandedCareer] =
    useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/history`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          throw new Error(
            "Failed to load assessment history."
          );
        }

        const data: HistoryResponse =
          await response.json();

        setHistory(
          Array.isArray(data.history)
            ? data.history
            : []
        );

        setTotalAssessments(
          Number(data.total_assessments) || 0
        );

        setTotalRecommendations(
          Number(data.total_recommendations) || 0
        );
      } catch (err) {
        console.error("History error:", err);

        setError(
          "Unable to load your assessment history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const toggleCareerDetails = (
    assessmentId: number,
    occupationCode: string
  ) => {
    const careerKey =
      `${assessmentId}-${occupationCode}`;

    setExpandedCareer(
      expandedCareer === careerKey
        ? null
        : careerKey
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="history-page">
            <div className="history-loading">
              <div className="loading-spinner">
                ⟳
              </div>

              <h2>
                Loading your history...
              </h2>

              <p>
                Please wait while we retrieve
                your previous assessments.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="history-page">

          {/* HEADER */}

          <section className="history-hero">
            <div>
              <p className="welcome-label">
                YOUR ACTIVITY
              </p>

              <h1>
                Assessment History
              </h1>

              <p>
                Review your previous career
                assessments and recommendations.
              </p>
            </div>

            <div className="history-hero-icon">
              📊
            </div>
          </section>


          {/* ERROR */}

          {error && (
            <div className="history-error">
              <span>⚠</span>

              <div>
                <strong>
                  Something went wrong
                </strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>
            </div>
          )}


          {/* SUMMARY */}

          {!error && (
            <section className="history-summary">

              <div className="history-stat-card">
                <div className="history-stat-icon">
                  📋
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


              <div className="history-stat-card">
                <div className="history-stat-icon">
                  🎯
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


              <div className="history-stat-card">
                <div className="history-stat-icon">
                  ✨
                </div>

                <div>
                  <span>
                    Careers Per Assessment
                  </span>

                  <strong>
                    5
                  </strong>
                </div>
              </div>

            </section>
          )}


          {/* EMPTY */}

          {!error &&
            history.length === 0 && (
              <section className="history-empty">

                <div className="history-empty-icon">
                  📋
                </div>

                <h2>
                  No assessments yet
                </h2>

                <p>
                  Complete your first career
                  assessment to see your
                  recommendations here.
                </p>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate("/assessment")
                  }
                >
                  Take Assessment →
                </button>

              </section>
            )}


          {/* HISTORY */}

          {!error &&
            history.length > 0 && (
              <div className="history-list">

                {history.map(
                  (assessment, index) => {

                    const displayNumber =
                      index + 1;

                    return (
                      <section
                        className="history-assessment-card"
                        key={
                          assessment.assessment_id
                        }
                      >

                        {/* ASSESSMENT HEADER */}

                        <div className="history-assessment-header">

                          <div>
                            <p className="history-assessment-label">
                              ASSESSMENT
                            </p>

                            <h2 className="history-assessment-number">
                              Assessment {displayNumber}
                            </h2>

                            <p>
                              {
                                assessment
                                  .recommendations
                                  .length
                              }{" "}
                              career recommendations
                            </p>
                          </div>

                        </div>


                        {/* RECOMMENDATIONS */}

                        <div className="history-recommendations">

                          {assessment.recommendations.map(
                            (
                              recommendation,
                              recommendationIndex
                            ) => {

                              const rank =
                                recommendationIndex +
                                1;

                              const rawPercentage =
                                Number(
                                  recommendation
                                    .similarity_score
                                ) * 100;

                              const matchPercentage =
                                Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number.isFinite(
                                      rawPercentage
                                    )
                                      ? rawPercentage
                                      : 0
                                  )
                                );

                              const isTop =
                                rank === 1;

                              const careerKey =
                                `${assessment.assessment_id}-${recommendation.occupation_code}`;

                              const isExpanded =
                                expandedCareer ===
                                careerKey;

                              const ai =
                                recommendation
                                  .ai_explanation ||
                                {};

                              const whySuitable =
                                Array.isArray(
                                  ai.why_suitable
                                )
                                  ? ai.why_suitable
                                  : [];

                              const importantSkills =
                                Array.isArray(
                                  ai.important_skills
                                )
                                  ? ai.important_skills
                                  : [];

                              const skillsToImprove =
                                Array.isArray(
                                  ai.skills_to_improve
                                )
                                  ? ai.skills_to_improve
                                  : [];

                              const learningRoadmap =
                                Array.isArray(
                                  ai.learning_roadmap
                                )
                                  ? ai.learning_roadmap
                                  : [];

                              const hasAI =
                                whySuitable.length >
                                  0 ||
                                importantSkills.length >
                                  0 ||
                                skillsToImprove.length >
                                  0 ||
                                learningRoadmap.length >
                                  0;

                              return (
                                <article
                                  className={`history-recommendation ${
                                    isTop
                                      ? "history-top-recommendation"
                                      : ""
                                  }`}
                                  key={
                                    recommendation
                                      .occupation_code ||
                                    `${recommendation.career}-${recommendationIndex}`
                                  }
                                >

                                  {/* CAREER HEADER */}

                                  <div className="history-recommendation-header">

                                    <div className="history-rank-area">

                                      <div
                                        className={`history-rank ${
                                          isTop
                                            ? "history-gold-rank"
                                            : ""
                                        }`}
                                      >
                                        {isTop
                                          ? "★"
                                          : rank}
                                      </div>

                                      <div className="history-career-info">

                                        <p>
                                          {isTop
                                            ? "BEST MATCH"
                                            : `RECOMMENDATION ${rank}`}
                                        </p>

                                        <h3>
                                          {
                                            recommendation.career
                                          }
                                        </h3>

                                      </div>

                                    </div>

                                    <div className="history-match-score">

                                      <strong>
                                        {matchPercentage.toFixed(
                                          0
                                        )}
                                        %
                                      </strong>

                                      <span>
                                        Match
                                      </span>

                                    </div>

                                  </div>


                                  {/* DESCRIPTION */}

                                  <div className="history-career-description">
                                    <p>
                                      {
                                        recommendation.description
                                      }
                                    </p>
                                  </div>


                                  {/* MATCH BAR */}

                                  <div className="history-match-bar">

                                    <div
                                      className="history-match-fill"
                                      style={{
                                        width: `${matchPercentage}%`,
                                      }}
                                    />

                                  </div>


                                  {/* DETAIL BUTTON */}

                                  <button
                                    type="button"
                                    className="history-view-detail-button"
                                    onClick={() =>
                                      toggleCareerDetails(
                                        assessment.assessment_id,
                                        recommendation.occupation_code
                                      )
                                    }
                                  >
                                    {isExpanded
                                      ? "Hide Details ↑"
                                      : "View in Detail →"}
                                  </button>


                                  {/* DETAILS */}

                                  {isExpanded && (
                                    <div className="history-detail-content">

                                      {hasAI ? (
                                        <>

                                          {/* WHY SUITABLE */}

                                          {whySuitable.length >
                                            0 && (
                                            <div className="history-ai-section">

                                              <div className="history-ai-heading">

                                                <span>
                                                  ✨
                                                </span>

                                                <div>

                                                  <h3>
                                                    Why this career suits you
                                                  </h3>

                                                  <p>
                                                    AI-generated insights based
                                                    on your assessment profile.
                                                  </p>

                                                </div>

                                              </div>


                                              <div className="history-reason-list">

                                                {whySuitable.map(
                                                  (
                                                    reason,
                                                    reasonIndex
                                                  ) => (
                                                    <div
                                                      className="history-reason-item"
                                                      key={
                                                        reasonIndex
                                                      }
                                                    >

                                                      <span>
                                                        ✓
                                                      </span>

                                                      <p>
                                                        {reason}
                                                      </p>

                                                    </div>
                                                  )
                                                )}

                                              </div>

                                            </div>
                                          )}


                                          {/* SKILLS */}

                                          {(importantSkills.length >
                                            0 ||
                                            skillsToImprove.length >
                                              0) && (

                                            <div className="history-skills-grid">

                                              <div className="history-skill-section">

                                                <h3>
                                                  Important Skills
                                                </h3>

                                                {importantSkills.length >
                                                0 ? (
                                                  <div className="history-skill-tags">

                                                    {importantSkills.map(
                                                      (
                                                        skill,
                                                        skillIndex
                                                      ) => (
                                                        <span
                                                          className="history-skill-tag"
                                                          key={
                                                            skillIndex
                                                          }
                                                        >
                                                          {skill}
                                                        </span>
                                                      )
                                                    )}

                                                  </div>
                                                ) : (
                                                  <p className="history-no-data">
                                                    No skill information
                                                    available.
                                                  </p>
                                                )}

                                              </div>


                                              <div className="history-skill-section">

                                                <h3>
                                                  Skills to Improve
                                                </h3>

                                                {skillsToImprove.length >
                                                0 ? (
                                                  <div className="history-skill-tags">

                                                    {skillsToImprove.map(
                                                      (
                                                        skill,
                                                        skillIndex
                                                      ) => (
                                                        <span
                                                          className="history-improve-tag"
                                                          key={
                                                            skillIndex
                                                          }
                                                        >
                                                          {skill}
                                                        </span>
                                                      )
                                                    )}

                                                  </div>
                                                ) : (
                                                  <p className="history-no-data">
                                                    No improvement areas
                                                    available.
                                                  </p>
                                                )}

                                              </div>

                                            </div>
                                          )}


                                          {/* ROADMAP */}

                                          {learningRoadmap.length >
                                            0 && (

                                            <div className="history-roadmap-section">

                                              <div className="history-roadmap-heading">

                                                <span>
                                                  📚
                                                </span>

                                                <div>

                                                  <h3>
                                                    Learning Roadmap
                                                  </h3>

                                                  <p>
                                                    A suggested path to prepare
                                                    for this career.
                                                  </p>

                                                </div>

                                              </div>


                                              <div className="history-roadmap">

                                                {learningRoadmap.map(
                                                  (
                                                    step,
                                                    stepIndex
                                                  ) => (

                                                    <div
                                                      className="history-roadmap-step"
                                                      key={
                                                        step.step ||
                                                        stepIndex
                                                      }
                                                    >

                                                      <div className="history-roadmap-number">
                                                        {step.step ||
                                                          stepIndex +
                                                            1}
                                                      </div>

                                                      <div className="history-roadmap-content">

                                                        <h4>
                                                          {
                                                            step.title
                                                          }
                                                        </h4>

                                                        <p>
                                                          {
                                                            step.description
                                                          }
                                                        </p>

                                                      </div>

                                                    </div>

                                                  )
                                                )}

                                              </div>

                                            </div>
                                          )}

                                        </>
                                      ) : (

                                        <div className="history-ai-unavailable">

                                          <span>
                                            i
                                          </span>

                                          <div>

                                            <strong>
                                              AI details are not available
                                            </strong>

                                            <p>
                                              This assessment was completed
                                              before AI explanations were saved
                                              in your career history. New
                                              assessments will include these
                                              details.
                                            </p>

                                          </div>

                                        </div>
                                      )}

                                    </div>
                                  )}

                                </article>
                              );
                            }
                          )}

                        </div>

                      </section>
                    );
                  }
                )}

              </div>
            )}


          {/* ACTIONS */}

          {!error &&
            history.length > 0 && (
              <div className="history-actions">

                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >
                  ← Dashboard
                </button>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate("/assessment")
                  }
                >
                  Take New Assessment →
                </button>

              </div>
            )}

        </main>
      </div>
    </div>
  );
}

export default History;