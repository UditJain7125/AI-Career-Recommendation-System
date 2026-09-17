import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


/* =========================================
   TYPES
========================================= */

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
  rank: number;
  career: string;
  occupation_code: string;
  description: string;
  similarity_score: number;
  ai_explanation?: AIExplanation;
}

interface RecommendationResult {
  assessment_id: number;
  recommendations: Recommendation[];
}


/* =========================================
   RESULT COMPONENT
========================================= */

function Result() {
  const navigate = useNavigate();

  const [result, setResult] =
    useState<RecommendationResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* Career whose details are currently open */
  const [expandedCareer, setExpandedCareer] =
    useState<string | null>(null);


  /* =========================================
     LOAD RESULT FROM SESSION STORAGE
  ========================================= */

  useEffect(() => {
    const savedResult =
      sessionStorage.getItem(
        "recommendationResult"
      );

    if (!savedResult) {
      navigate("/dashboard");
      return;
    }

    try {
      const parsedResult =
        JSON.parse(savedResult);

      /* Basic validation */

      if (
        !parsedResult ||
        typeof parsedResult !== "object" ||
        !Array.isArray(
          parsedResult.recommendations
        )
      ) {
        throw new Error(
          "Invalid recommendation result"
        );
      }

      setResult(parsedResult);

    } catch (error) {
      console.error(
        "Result parsing error:",
        error
      );

      sessionStorage.removeItem(
        "recommendationResult"
      );

      navigate("/dashboard");

    } finally {
      setLoading(false);
    }

  }, [navigate]);


  /* =========================================
     LOADING
  ========================================= */

  if (loading || !result) {

    return (
      <div className="dashboard-layout">

        <Sidebar />

        <div className="dashboard-main">

          <Topbar />

          <main className="result-page">

            <div className="result-loading">

              <div className="loading-spinner">
                ⟳
              </div>

              <h2>
                Loading your results...
              </h2>

              <p>
                Please wait while we prepare
                your career recommendations.
              </p>

            </div>

          </main>

        </div>

      </div>
    );
  }


  /* =========================================
     EMPTY RESULT
  ========================================= */

  if (
    result.recommendations.length === 0
  ) {

    return (
      <div className="dashboard-layout">

        <Sidebar />

        <div className="dashboard-main">

          <Topbar />

          <main className="result-page">

            <section className="result-empty">

              <div className="result-empty-icon">
                🎯
              </div>

              <h2>
                No recommendations found
              </h2>

              <p>
                We could not generate career
                recommendations from this
                assessment.
              </p>

              <button
                className="dashboard-primary-button"
                onClick={() =>
                  navigate("/assessment")
                }
              >
                Take Assessment Again →
              </button>

            </section>

          </main>

        </div>

      </div>
    );
  }


  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="result-page">


          {/* =================================
              RESULT HERO
          ================================= */}

          <section className="result-hero">

            <div>

              <p className="welcome-label">
                ASSESSMENT COMPLETE
              </p>

              <h1>
                Your Career Recommendations
              </h1>

              <p>
                Based on your skills, abilities,
                and interests, here are the careers
                that best match your profile.
              </p>

            </div>

            <div className="result-hero-icon">
              🎯
            </div>

          </section>


          {/* =================================
              HOW RESULTS WERE GENERATED
          ================================= */}

          <section className="result-method-card">

            <div className="result-method-header">

              <div className="result-method-icon">
                ✨
              </div>

              <div>

                <p>
                  HOW YOUR RESULTS WERE GENERATED
                </p>

                <h2>
                  Personalized Career Matching
                </h2>

              </div>

            </div>

            <p className="result-method-description">
              Your responses were analyzed across
              your skills, abilities, and interests.
              Your profile was compared with career
              profiles from the O*NET dataset to find
              the careers that best match your profile.
            </p>

            <div className="result-method-stats">

              <div>

                <strong>
                  68
                </strong>

                <span>
                  Questions Analyzed
                </span>

              </div>

              <div>

                <strong>
                  1,016
                </strong>

                <span>
                  Career Profiles Compared
                </span>

              </div>

              <div>

                <strong>
                  {result.recommendations.length}
                </strong>

                <span>
                  Career Matches
                </span>

              </div>

            </div>

          </section>


          {/* =================================
              RECOMMENDATIONS
          ================================= */}

          <div className="results-list">

            {result.recommendations.map(
              (
                recommendation,
                index
              ) => {

                /* =========================
                   SAFE RANK
                ========================= */

                const rank =
                  recommendation.rank ||
                  index + 1;


                /* =========================
                   SAFE MATCH PERCENTAGE
                ========================= */

                const rawPercentage =
                  Number(
                    recommendation.similarity_score
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


                /* =========================
                   TOP CAREER
                ========================= */

                const isTop =
                  rank === 1;


                /* =========================
                   CHECK DETAILS STATE
                ========================= */

                const isExpanded =
                  expandedCareer ===
                  recommendation.occupation_code;


                /* =========================
                   SAFE AI DATA
                ========================= */

                const ai =
                  recommendation.ai_explanation
                    || {};


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


                return (

                  <article
                    className={`career-result-card ${
                      isTop
                        ? "top-career"
                        : ""
                    }`}
                    key={
                      recommendation.occupation_code ||
                      `${recommendation.career}-${index}`
                    }
                  >


                    {/* =======================
                        CAREER HEADER
                    ======================= */}

                    <div className="career-result-header">

                      <div className="career-title-area">


                        {/* Rank */}

                        <div
                          className={`career-rank ${
                            isTop
                              ? "gold-rank"
                              : ""
                          }`}
                        >

                          {isTop
                            ? "★"
                            : rank}

                        </div>


                        {/* Career title */}

                        <div>

                          <p className="career-label">

                            {isTop
                              ? "BEST MATCH"
                              : `RECOMMENDATION #${rank}`}

                          </p>

                          <h2>
                            {recommendation.career}
                          </h2>

                        </div>

                      </div>


                      {/* Match score */}

                      <div className="match-score">

                        <strong>
                          {matchPercentage.toFixed(0)}%
                        </strong>

                        <span>
                          Match
                        </span>

                      </div>

                    </div>


                    {/* =======================
                        MATCH PROGRESS
                    ======================= */}

                    <div className="match-progress">

                      <div
                        className="match-progress-fill"
                        style={{
                          width: `${matchPercentage}%`,
                        }}
                      />

                    </div>


                    {/* =======================
                        CAREER DESCRIPTION
                    ======================= */}

                    <div className="career-description">

                      <h3>
                        About this career
                      </h3>

                      <p>
                        {recommendation.description ||
                          "No career description is available."}
                      </p>

                    </div>


                    {/* =======================
                        VIEW DETAILS BUTTON
                    ======================= */}

                    <button
                      type="button"
                      className="view-detail-button"
                      onClick={() => {

                        if (isExpanded) {

                          setExpandedCareer(null);

                        } else {

                          setExpandedCareer(
                            recommendation.occupation_code
                          );

                        }

                      }}
                    >

                      {isExpanded
                        ? "Hide Details ↑"
                        : "View in Detail →"}

                    </button>


                    {/* =================================
                        DETAILED AI CONTENT
                    ================================= */}

                    {isExpanded && (

                      <div className="career-detail-content">


                        {/* =======================
                            AI EXPLANATION
                        ======================= */}

                        <div className="ai-section">

                          <div className="ai-section-heading">

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


                          {whySuitable.length > 0 ? (

                            <div className="reason-list">

                              {whySuitable.map(
                                (
                                  reason,
                                  reasonIndex
                                ) => (

                                  <div
                                    className="reason-item"
                                    key={reasonIndex}
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

                          ) : (

                            <div className="ai-empty-message">

                              AI explanation is not
                              available for this career.

                            </div>

                          )}

                        </div>


                        {/* =======================
                            SKILLS
                        ======================= */}

                        <div className="skills-grid">


                          {/* Important Skills */}

                          <div className="skill-section">

                            <h3>
                              Important Skills
                            </h3>

                            {importantSkills.length >
                            0 ? (

                              <div className="skill-tags">

                                {importantSkills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (

                                    <span
                                      className="skill-tag"
                                      key={skillIndex}
                                    >
                                      {skill}
                                    </span>

                                  )
                                )}

                              </div>

                            ) : (

                              <p className="skills-empty">
                                No skill information
                                available.
                              </p>

                            )}

                          </div>


                          {/* Skills to Improve */}

                          <div className="skill-section improve-section">

                            <h3>
                              Skills to Improve
                            </h3>

                            {skillsToImprove.length >
                            0 ? (

                              <div className="skill-tags">

                                {skillsToImprove.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (

                                    <span
                                      className="improve-tag"
                                      key={skillIndex}
                                    >
                                      {skill}
                                    </span>

                                  )
                                )}

                              </div>

                            ) : (

                              <p className="skills-empty">
                                No improvement areas
                                available.
                              </p>

                            )}

                          </div>

                        </div>


                        {/* =======================
                            LEARNING ROADMAP
                        ======================= */}

                        <div className="roadmap-section">

                          <div className="roadmap-heading">

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


                          {learningRoadmap.length >
                          0 ? (

                            <div className="roadmap">

                              {learningRoadmap.map(
                                (
                                  step,
                                  stepIndex
                                ) => (

                                  <div
                                    className="roadmap-step"
                                    key={
                                      step.step ||
                                      stepIndex
                                    }
                                  >

                                    <div className="roadmap-number">

                                      {step.step ||
                                        stepIndex + 1}

                                    </div>

                                    <div className="roadmap-content">

                                      <h4>
                                        {step.title}
                                      </h4>

                                      <p>
                                        {step.description}
                                      </p>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          ) : (

                            <div className="ai-empty-message">

                              Learning roadmap is not
                              available for this career.

                            </div>

                          )}

                        </div>

                      </div>

                    )}

                  </article>

                );
              }
            )}

          </div>


          {/* =================================
              ACTIONS
          ================================= */}

          <div className="result-actions-modern">


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
              className="dashboard-secondary-button"
              onClick={() =>
                navigate("/history")
              }
            >
              View History
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

        </main>

      </div>

    </div>
  );
}

export default Result;