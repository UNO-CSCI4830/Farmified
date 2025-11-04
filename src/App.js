// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./Pages/Home";
import Database from "./Pages/Database";
import "./app.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/database" element={<Database />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;