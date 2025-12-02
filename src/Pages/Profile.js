// src/Pages/Profile.js
import React, { useEffect, useState } from 'react';
import { updateUser as updateUserAPI } from '../utils/api';
import '../styles/Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    fetch(`http://localhost:5001/api/user/${parsedUser.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setFormData({ ...data.user }); // initialize formData
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // convert arrays to comma-separated strings if needed
      const updatedData = { ...formData };
      if (Array.isArray(updatedData.crops)) updatedData.crops = updatedData.crops.join(', ');
      if (Array.isArray(updatedData.preferences)) updatedData.preferences = updatedData.preferences.join(', ');

      const response = await updateUserAPI(user.id, updatedData);
      setUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No user logged in.</p>;

  return (
<div className="profile-container">
  {/* Header */}
  <div className="profile-header">
    <h2>{user.firstName} {user.lastName}</h2>
    <span className="user-type-tag">{user.userType}</span>
  </div>

  {/* Info Sections */}
  <div className="profile-columns">
    {/* Personal Info */}
    <div className="profile-section">
      <h3>Personal Info</h3>
      <div className="profile-row">
        <label>Name:</label>
        {editMode ? (
          <>
            <input name="firstName" value={formData.firstName || ''} onChange={handleInputChange} />
            <input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} />
          </>
        ) : (
          <span>{user.firstName} {user.lastName}</span>
        )}
      </div>
      <div className="profile-row">
        <label>Email:</label>
        {editMode ? (
          <input name="email" value={formData.email || ''} onChange={handleInputChange} />
        ) : (
          <span>{user.email}</span>
        )}
      </div>
      <div className="profile-row">
        <label>Phone:</label>
        {editMode ? (
          <input name="phone" value={formData.phone || ''} onChange={handleInputChange} />
        ) : (
          <span>{user.phone}</span>
        )}
      </div>
      <div className="profile-row">
        <label>Location:</label>
        {editMode ? (
          <input name="location" value={formData.location || ''} onChange={handleInputChange} />
        ) : (
          <span>{user.location}</span>
        )}
      </div>
    </div>

    {/* Farm Info (only for farmers) */}
    {user.userType === "farmer" && (
      <div className="profile-section">
        <h3>Farm Info</h3>
        <div className="profile-row">
          <label>Farm Name:</label>
          {editMode ? (
            <input name="farmName" value={formData.farmName || ''} onChange={handleInputChange} />
          ) : (
            <span>{user.farmName}</span>
          )}
        </div>
        <div className="profile-row">
          <label>Crops:</label>
          {editMode ? (
            <input name="crops" value={formData.crops || ''} onChange={handleInputChange} />
          ) : (
            <span>{user.crops}</span>
          )}
        </div>
        <div className="profile-row">
          <label>Farm Size:</label>
          {editMode ? (
            <input name="farmSize" value={formData.farmSize || ''} onChange={handleInputChange} />
          ) : (
            <span>{user.farmSize}</span>
          )}
        </div>
      </div>
    )}
  </div>

  {/* Action Buttons */}
  <div className="profile-actions">
    {editMode ? (
      <>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => setEditMode(false)} disabled={saving}>
          Cancel
        </button>
      </>
    ) : (
      <button onClick={() => setEditMode(true)}>Edit Profile</button>
    )}
  </div>

  {message && <p className="profile-message">{message}</p>}
</div>
  );
}