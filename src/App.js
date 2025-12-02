// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./Pages/Home";
import Database from "./Pages/Database";
import MessageScreen from "./Pages/Messages";
import Signup from "./Pages/Signup";
import Profile from "./Pages/Profile";
import "./app.css";

// Component to conditionally show sidebar
function AppLayout({ children }) {
  const location = useLocation();
  const showSidebar = location.pathname !== "/signup" && location.pathname !== "/login";

  return (
    <div className="app-container">
      {showSidebar && <Sidebar />}
      <div className={`main-content ${!showSidebar ? "full-width" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/database" element={<Database />} />
          <Route path="/messages" element={<MessageScreen />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Signup />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;