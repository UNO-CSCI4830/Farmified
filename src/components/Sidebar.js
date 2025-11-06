import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const [hoverDropdown, setHoverDropdown] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to update user state
    const updateUser = () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    // Check if user is logged in on mount
    updateUser();

    // Listen for storage changes (when user logs in from another tab/window)
    window.addEventListener('storage', updateUser);

    // Also listen for custom events (when user logs in/out on same tab)
    window.addEventListener('userLoggedIn', updateUser);
    window.addEventListener('userLoggedOut', updateUser);

    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('userLoggedIn', updateUser);
      window.removeEventListener('userLoggedOut', updateUser);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate('/signup');
  };

  return (
    <div className="sidebar">
      <div>
        <h1>Farmified</h1>

        <Link to="/">Home</Link>

        <Link to="/messages">Messages</Link>

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

      {currentUser && (
        <div className="sign-out">
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;