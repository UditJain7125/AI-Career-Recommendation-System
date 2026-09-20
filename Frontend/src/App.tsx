import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Result from "./pages/Result";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Agent from "./pages/Agent";
function App() {
  return (
    <HashRouter basename="/AI-Career-Recommendation-System/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/agent" element={<Agent />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
