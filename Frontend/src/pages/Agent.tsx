import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { API_BASE_URL } from "./config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function Agent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I’m your AI Career Assistant. You can ask me about your recommended careers, skills to improve, assessment, or a specific career.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Reference to the bottom of the chat
  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (
    question?: string
  ) => {
    const message = (
      question ?? input
    ).trim();

    if (!message || loading) {
      return;
    }

    const token = localStorage.getItem(
      "token"
    );

    if (!token) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/agent/chat`,
        {
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.message,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Agent error:",
        error
      );

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I couldn't process your question right now. Please try again.",
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What are my recommended careers?",
    "What skills should I improve?",
    "What do you know about my profile?",
    "Tell me about my assessment",
  ];

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="dashboard-main">

        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <main className="dashboard-content">

          {/* Agent Header */}
          <section className="agent-header">

            <div>

              <p className="agent-label">
                AI CAREER ASSISTANT
              </p>

              <h1>
                Career Guidance Assistant
              </h1>

              <p>
                Ask questions about your career
                recommendations, skills,
                assessment, and career paths.
              </p>

            </div>

          </section>

          {/* Suggested Questions */}
          <section className="agent-suggestions">

            <p className="agent-suggestions-title">
              Try asking
            </p>

            <div className="agent-suggestion-list">

              {suggestedQuestions.map(
                (question) => (
                  <button
                    key={question}
                    className="agent-suggestion-button"
                    onClick={() =>
                      sendMessage(question)
                    }
                    disabled={loading}
                  >
                    {question}
                  </button>
                )
              )}

            </div>

          </section>

          {/* Chat Container */}
          <section className="agent-chat-container">

            {/* Messages */}
            <div className="agent-messages">

              {messages.map(
                (message, index) => (
                  <div
                    key={index}
                    className={`agent-message ${
                      message.role === "user"
                        ? "agent-user-message"
                        : "agent-assistant-message"
                    }`}
                  >

                    <div className="agent-message-label">
                      {message.role === "user"
                        ? "You"
                        : "AI Assistant"}
                    </div>

                    <div className="agent-message-content">
                      {message.content}
                    </div>

                  </div>
                )
              )}

              {/* Loading */}
              {loading && (
                <div className="agent-message agent-assistant-message">

                  <div className="agent-message-label">
                    AI Assistant
                  </div>

                  <div className="agent-message-content">
                    Thinking...
                  </div>

                </div>
              )}

              {/* Scroll Target */}
              <div
                ref={messagesEndRef}
              />

            </div>

            {/* Input */}
            <div className="agent-input-container">

              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask a career question..."
                disabled={loading}
              />

              <button
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
              >
                {loading
                  ? "..."
                  : "Send"}
              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Agent;