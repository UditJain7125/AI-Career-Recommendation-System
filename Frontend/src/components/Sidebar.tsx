import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = () => {
    setMobileOpen((previous) => !previous);
  };

  const closeMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("recommendationResult");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={toggleMenu}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          mobileOpen ? "mobile-sidebar-open" : ""
        }`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">AI</div>

          <div>
            <h2>CareerAI</h2>
            <span>Recommendation</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`sidebar-link ${
              location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            <span>▣</span>
            Dashboard
          </Link>

          {/* Assessment */}
          <Link
            to="/assessment"
            className={`sidebar-link ${
              location.pathname === "/assessment"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            <span>✓</span>
            Assessment
          </Link>

          {/* AI Career Assistant */}
          <Link
            to="/agent"
            className={`sidebar-link ${
              location.pathname === "/agent"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            <span>✦</span>
            AI Assistant
          </Link>

          {/* History */}
          <Link
            to="/history"
            className={`sidebar-link ${
              location.pathname === "/history"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            <span>◷</span>
            History
          </Link>

        </nav>

        {/* Bottom Navigation */}
        <div className="sidebar-bottom">

          {/* Profile */}
          <Link
            to="/profile"
            className={`sidebar-link ${
              location.pathname === "/profile"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >
            <span>⚙</span>
            Profile
          </Link>

          {/* Logout */}
          <button
            className="sidebar-logout"
            onClick={() => {
              closeMenu();
              handleLogout();
            }}
          >
            <span>⇥</span>
            Logout
          </button>

        </div>
      </aside>
    </>
  );
}

export default Sidebar;