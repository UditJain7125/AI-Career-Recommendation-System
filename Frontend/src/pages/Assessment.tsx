import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

interface Question {
  feature: string;
  question: string;
  min_rating: number;
  max_rating: number;
}

function Assessment() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] =
    useState<Record<string, number>>({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* =========================================
     LOAD QUESTIONS
  ========================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/assessment/questions"
        );

        if (
          !response.data ||
          !Array.isArray(response.data.questions)
        ) {
          throw new Error("Invalid question data.");
        }

        setQuestions(response.data.questions);
      } catch (err) {
        console.error("Questions error:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          setError(
            err.response?.data?.detail ||
              "Unable to load assessment questions."
          );
        } else {
          setError(
            "Unable to load assessment questions."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate]);


  /* =========================================
     SELECT ANSWER
  ========================================= */

  const handleAnswer = (value: number) => {
    const current = questions[currentQuestion];

    if (!current) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [current.feature]: value,
    }));

    setError("");
  };


  /* =========================================
     NEXT QUESTION
  ========================================= */

  const goNext = () => {
    const current = questions[currentQuestion];

    if (!current) {
      return;
    }

    if (answers[current.feature] === undefined) {
      setError(
        "Please select an answer before continuing."
      );
      return;
    }

    setError("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };


  /* =========================================
     PREVIOUS QUESTION
  ========================================= */

  const goPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );

      setError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };


  /* =========================================
     SUBMIT ASSESSMENT
  ========================================= */

  const handleSubmit = async () => {
    const unanswered = questions.filter(
      (question) =>
        answers[question.feature] === undefined
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${
          unanswered.length
        } question${
          unanswered.length > 1 ? "s are" : " is"
        } still unanswered.`
      );

      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend",
        {
          answers: answers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      sessionStorage.setItem(
        "recommendationResult",
        JSON.stringify(response.data)
      );

      navigate("/result");
    } catch (err) {
      console.error(
        "Recommendation error:",
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
            "Unable to generate recommendations."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="assessment-page">
            <div className="assessment-loading">
              <div className="loading-spinner">
                ⟳
              </div>

              <h2>
                Loading assessment...
              </h2>

              <p>
                Please wait while we prepare
                your questions.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }


  /* =========================================
     NO QUESTIONS / ERROR
  ========================================= */

  if (questions.length === 0) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="assessment-page">
            <div className="assessment-error-card">
              <div className="assessment-error-icon">
                !
              </div>

              <h2>
                Unable to load assessment
              </h2>

              <p>
                {error ||
                  "No assessment questions were found."}
              </p>

              <button
                className="dashboard-primary-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Back to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }


  /* =========================================
     CURRENT QUESTION
  ========================================= */

  const question =
    questions[currentQuestion];

  const selectedAnswer =
    answers[question.feature];

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  const answeredCount =
    Object.keys(answers).length;

  const isLastQuestion =
    currentQuestion ===
    questions.length - 1;


  /* =========================================
     CATEGORY
  ========================================= */

  let category = "Interests";

  if (
    question.feature.startsWith("skill_")
  ) {
    category = "Skills";
  } else if (
    question.feature.startsWith("ability_")
  ) {
    category = "Abilities";
  }


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="assessment-page">

          {/* =================================
              PAGE HEADER
          ================================= */}

          <section className="assessment-title">

            <div>
              <p className="welcome-label">
                CAREER ASSESSMENT
              </p>

              <h1>
                Discover Your Career Path
              </h1>

              <p>
                Answer each question honestly.
                Your responses help us find careers
                that match your skills, abilities
                and interests.
              </p>
            </div>

          </section>


          {/* =================================
              PROGRESS
          ================================= */}

          <section className="assessment-progress-card">

            <div className="assessment-progress-top">

              <div className="assessment-progress-text">

                <span>
                  Assessment Progress
                </span>

                <strong>
                  Question {currentQuestion + 1} of{" "}
                  {questions.length}
                </strong>

              </div>

              <div className="progress-percentage">
                {Math.round(progress)}%
              </div>

            </div>


            <div className="modern-progress-bar">

              <div
                className="modern-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>


            <div className="assessment-progress-footer">
              <span>
                {answeredCount} of{" "}
                {questions.length} answered
              </span>

              <span>
                {questions.length -
                  answeredCount} remaining
              </span>
            </div>

          </section>


          {/* =================================
              QUESTION
          ================================= */}

          <section className="modern-question-card">

            <div className="question-top">

              <span className="question-badge">
                Question {currentQuestion + 1}
              </span>

              <span className="question-category">
                {category}
              </span>

            </div>


            <h2>
              {question.question}
            </h2>


            <p className="question-instruction">
              How would you rate yourself?
            </p>


            {/* =================================
                RATING OPTIONS
            ================================= */}

            <div className="modern-rating">

              {[1, 2, 3, 4, 5].map(
                (value) => {

                  const selected =
                    selectedAnswer === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      className={`modern-rating-option ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleAnswer(value)
                      }
                      disabled={submitting}
                    >

                      <span className="rating-number">
                        {value}
                      </span>

                      <span className="rating-text">
                        {value === 1 &&
                          "Very Low"}

                        {value === 2 &&
                          "Low"}

                        {value === 3 &&
                          "Moderate"}

                        {value === 4 &&
                          "High"}

                        {value === 5 &&
                          "Very High"}
                      </span>

                    </button>
                  );
                }
              )}

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {error && (
              <div className="assessment-error">
                {error}
              </div>
            )}


            {/* =================================
                NAVIGATION
            ================================= */}

            <div className="assessment-navigation">

              <button
                type="button"
                className="assessment-back-button"
                onClick={goPrevious}
                disabled={
                  currentQuestion === 0 ||
                  submitting
                }
              >
                ← Previous
              </button>


              {!isLastQuestion ? (
                <button
                  type="button"
                  className="dashboard-primary-button assessment-next-button"
                  onClick={goNext}
                  disabled={submitting}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  type="button"
                  className="dashboard-primary-button assessment-next-button"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? "Generating..."
                    : "Submit Assessment ✓"}
                </button>
              )}

            </div>

          </section>


          {/* =================================
              TIP
          ================================= */}

          <section className="assessment-tip">

            <span className="tip-icon">
              💡
            </span>

            <div>
              <strong>
                Tip
              </strong>

              <p>
                There are no right or wrong
                answers. Choose the option that
                best describes you.
              </p>
            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Assessment;