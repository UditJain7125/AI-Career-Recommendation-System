import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("recommendationResult");
    navigate("/login");
  };

  return (
    <header className="top-header">
      <div className="header-inner">
        <Link to="/dashboard" className="brand">
          AI Career Recommendation
        </Link>

        <button
          className="nav-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <nav className="main-navbar">
        <div className="nav-inner">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assessment">Assessment</Link>
          <Link to="/history">History</Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;