import React, { useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [userType, setUserType] = useState('');
  const [profileCreated, setProfileCreated] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    farmName: '',
    crops: [],
    farmSize: '',
    preferences: [],
    deliveryAddress: ''
  });

  // Top 10 fruits and vegetables grown in Nebraska
  const nebraskaProduce = [
    'Corn',
    'Soybeans',
    'Wheat',
    'Alfalfa',
    'Dry Beans',
    'Potatoes',
    'Apples',
    'Cherries',
    'Peaches',
    'Pumpkins',
    'Tomatoes',
    'Sweet Corn',
    'Green Beans',
    'Peas',
    'Cucumbers'
  ];

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('One special character');
    }
    if (!/(?=.*[0-9])/.test(password)) {
      errors.push('One number');
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }

    if (type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prevState => ({
        ...prevState,
        [name]: selectedOptions
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevState => {
      const currentSelection = prevState[name] || [];
      if (checked) {
        return {
          ...prevState,
          [name]: [...currentSelection, value]
        };
      } else {
        return {
          ...prevState,
          [name]: currentSelection.filter(item => item !== value)
        };
      }
    });
  };

  const checkExistingUser = async (email, phone) => {
    try {
      const existingProfiles = localStorage.getItem('farmified_profiles');
      
      if (existingProfiles) {
        const profiles = JSON.parse(existingProfiles);
        const existingEmail = profiles.find(profile => profile.email === email);
        const existingPhone = profiles.find(profile => profile.phone === phone);
        
        if (existingEmail) return 'email';
        if (existingPhone) return 'phone';
      }
      return null;
    } catch (error) {
      console.error('Error checking existing user:', error);
      return null;
    }
  };

  const appendToCSV = async (profileData) => {
    try {
      // Get existing profiles from localStorage
      const existingProfiles = localStorage.getItem('farmified_profiles');
      const profiles = existingProfiles ? JSON.parse(existingProfiles) : [];
      
      const newProfile = {
        id: Date.now(),
        userType,
        ...profileData,
        createdAt: new Date().toISOString()
      };
      
      profiles.push(newProfile);
      localStorage.setItem('farmified_profiles', JSON.stringify(profiles));
      
      // Convert all profiles to CSV
      const csv = Papa.unparse(profiles);
      
      // Instead of automatically downloading, we'll provide a download button
      // and store the latest CSV in localStorage for manual download
      localStorage.setItem('farmified_latest_csv', csv);
      
      console.log('Profile saved! Total profiles:', profiles.length);
      console.log('CSV data ready for download');
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!userType) {
      alert("Please select Farmer or Consumer");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      alert("Please fix password requirements before submitting!");
      return;
    }

    // Check for crop/preference selection
    if (userType === 'farmer' && formData.crops.length === 0) {
      alert("Please select at least one crop you grow!");
      return;
    }

    if (userType === 'consumer' && formData.preferences.length === 0) {
      alert("Please select at least one product preference!");
      return;
    }

    // Check for existing user
    const existingUser = await checkExistingUser(formData.email, formData.phone);
    if (existingUser === 'email') {
      alert("This email address is already registered!");
      return;
    }
    if (existingUser === 'phone') {
      alert("This phone number is already registered!");
      return;
    }

    // Prepare data for saving
    const profileToSave = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      ...(userType === 'farmer' && {
        farmName: formData.farmName,
        crops: formData.crops.join(', '),
        farmSize: formData.farmSize
      }),
      ...(userType === 'consumer' && {
        preferences: formData.preferences.join(', '),
        deliveryAddress: formData.deliveryAddress
      })
    };

    // Save to CSV/localStorage
    const success = await appendToCSV(profileToSave);
    
    if (success) {
      setProfileCreated(true);
    } else {
      alert("Error creating profile. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      location: '',
      farmName: '',
      crops: [],
      farmSize: '',
      preferences: [],
      deliveryAddress: ''
    });
    setPasswordErrors([]);
    setUserType('');
    setProfileCreated(false);
  };

  // Success Page Component
  if (profileCreated) {
    return (
      <div className="App">
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h1>Profile Successfully Created!</h1>
            <p>Your {userType} profile has been created successfully.</p>
            <p>Welcome to Farmified!</p>
            <button onClick={resetForm} className="okay-btn">
              Okay
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile Creation Form
  return (
    <div className="App">
      <div className="profile-container">
        <h1>Farmified - Create Profile</h1>
        
        {/* User Type Selection */}
        <div className="user-type-selection">
          <h3>I am a:</h3>
          <div className="user-type-buttons">
            <button 
              type="button"
              className={`user-type-btn ${userType === 'farmer' ? 'active' : ''}`}
              onClick={() => setUserType('farmer')}
            >
              Farmer
            </button>
            <button 
              type="button"
              className={`user-type-btn ${userType === 'consumer' ? 'active' : ''}`}
              onClick={() => setUserType('consumer')}
            >
              Consumer
            </button>
          </div>
        </div>

        {userType && (
          <form onSubmit={handleSubmit} className="profile-form">
            {/* Common Personal Details */}
            <div className="form-section">
              <h3>Personal Details</h3>
              <div className="form-row">
                <div className="input-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="form-section">
              <h3>Security</h3>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li className={formData.password.length >= 8 ? 'valid' : 'invalid'}>
                      At least 8 characters
                    </li>
                    <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : 'invalid'}>
                      One uppercase letter
                    </li>
                    <li className={/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password) ? 'valid' : 'invalid'}>
                      One special character
                    </li>
                    <li className={/(?=.*[0-9])/.test(formData.password) ? 'valid' : 'invalid'}>
                      One number
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="error-message">Passwords do not match!</p>
                )}
              </div>
            </div>

            {/* Farmer Specific Fields */}
            {userType === 'farmer' && (
              <div className="form-section">
                <h3>Farm Details</h3>
                <div className="input-group">
                  <input
                    type="text"
                    name="farmName"
                    placeholder="Farm Name"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>What do you grow? (Select all that apply)</label>
                  <div className="checkbox-grid">
                    {nebraskaProduce.map((produce) => (
                      <label key={produce} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="crops"
                          value={produce}
                          checked={formData.crops.includes(produce)}
                          onChange={handleCheckboxChange}
                        />
                        {produce}
                      </label>
                    ))}
                  </div>
                  {formData.crops.length === 0 && (
                    <p className="error-message">Please select at least one crop</p>
                  )}
                </div>
                
                <div className="input-group">
                  <input
                    type="text"
                    name="farmSize"
                    placeholder="Farm Size (in acres)"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Consumer Specific Fields */}
            {userType === 'consumer' && (
              <div className="form-section">
                <h3>Consumer Preferences</h3>
                <div className="input-group">
                  <label>What products are you interested in? (Select all that apply)</label>
                  <div className="checkbox-grid">
                    {nebraskaProduce.map((produce) => (
                      <label key={produce} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="preferences"
                          value={produce}
                          checked={formData.preferences.includes(produce)}
                          onChange={handleCheckboxChange}
                        />
                        {produce}
                      </label>
                    ))}
                  </div>
                  {formData.preferences.length === 0 && (
                    <p className="error-message">Please select at least one preference</p>
                  )}
                </div>
                
                <div className="input-group">
                  <textarea
                    name="deliveryAddress"
                    placeholder="Delivery Address"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={passwordErrors.length > 0 || (userType === 'farmer' && formData.crops.length === 0) || (userType === 'consumer' && formData.preferences.length === 0)}
            >
              Create Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;