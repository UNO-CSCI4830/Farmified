import React, { useState } from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  const [hoverDropdown, setHoverDropdown] = useState(null);

  return (
    <div className="sidebar">
      <div>
        <h1>Farmified</h1>

        <Link to="/">Home</Link>

        {/* Database Dropdown */}
        <div
          className="dropdown"
          onMouseEnter={() => setHoverDropdown("database")}
          onMouseLeave={() => setHoverDropdown(null)}
        >
          <div className="dropdown-title">Database</div>
          {hoverDropdown === "database" && (
            <div className="dropdown-content">
              <Link to="/database/add">Add Entry</Link>
              <Link to="/database">View Records</Link>
              <Link to="/database/export">Export Data</Link>
            </div>
          )}
        </div>

        {/* Connect Dropdown */}
        <div
          className="dropdown"
          onMouseEnter={() => setHoverDropdown("connect")}
          onMouseLeave={() => setHoverDropdown(null)}
        >
          <div className="dropdown-title">Connect</div>
          {hoverDropdown === "connect" && (
            <div className="dropdown-content">
              <Link to="/connect/send-message">Send Message</Link>
              <Link to="/connect/profiles">Message Screen Profiles</Link>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div
          className="dropdown"
          onMouseEnter={() => setHoverDropdown("profile")}
          onMouseLeave={() => setHoverDropdown(null)}
        >
          <div className="dropdown-title">Profile</div>
          {hoverDropdown === "profile" && (
            <div className="dropdown-content">
              <Link to="/profile/edit">Edit</Link>
              <Link to="/profile/view">View</Link>
              <Link to="/profile/notifications">Notifications</Link>
            </div>
          )}
        </div>

        <Link to="/about">About</Link>
      </div>

      <div className="sign-out">
        <button onClick={() => alert("Signing out...")}>Sign Out</button>
      </div>
    </div>
  );
}

export default Sidebar;