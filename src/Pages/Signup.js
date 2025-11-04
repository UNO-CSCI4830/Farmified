// src/Pages/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css'; // optional, create for styling

function Signup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [userType, setUserType] = useState('');
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
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loginError, setLoginError] = useState('');

  const nebraskaProduce = [
    'Corn','Soybeans','Wheat','Alfalfa','Dry Beans','Potatoes',
    'Apples','Cherries','Peaches','Pumpkins','Tomatoes',
    'Sweet Corn','Green Beans','Peas','Cucumbers'
  ];

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('One uppercase letter');
    if (!/(?=.*[0-9])/.test(password)) errors.push('One number');
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'password') setPasswordErrors(validatePassword(value));
    if (type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
      const current = prev[name] || [];
      if (checked) return { ...prev, [name]: [...current, value] };
      return { ...prev, [name]: current.filter(item => item !== value) };
    });
  };

  const checkExistingUser = (email, phone) => {
    const profiles = JSON.parse(localStorage.getItem('farmified_profiles')) || [];
    if (profiles.find(p => p.email === email)) return 'email';
    if (profiles.find(p => p.phone === phone)) return 'phone';
    return null;
  };

  const saveProfile = (profile) => {
    const profiles = JSON.parse(localStorage.getItem('farmified_profiles')) || [];
    profiles.push(profile);
    localStorage.setItem('farmified_profiles', JSON.stringify(profiles));
    localStorage.setItem('currentUser', JSON.stringify(profile));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!userType) return alert('Please select Farmer or Consumer');
    if (formData.password !== formData.confirmPassword) return alert("Passwords don't match");
    const pwErrors = validatePassword(formData.password);
    if (pwErrors.length) return alert('Password does not meet requirements');
    if (userType === 'farmer' && formData.crops.length === 0) return alert('Select at least one crop');
    if (userType === 'consumer' && formData.preferences.length === 0) return alert('Select at least one preference');

    const existing = checkExistingUser(formData.email, formData.phone);
    if (existing === 'email') return alert('Email already registered');
    if (existing === 'phone') return alert('Phone already registered');

    const profile = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      userType,
      ...(userType === 'farmer' && {
        farmName: formData.farmName,
        crops: formData.crops.join(', '),
        farmSize: formData.farmSize
      }),
      ...(userType === 'consumer' && {
        preferences: formData.preferences.join(', '),
        deliveryAddress: formData.deliveryAddress
      }),
      password: formData.password
    };

    saveProfile(profile);
    navigate('/'); // redirect to Home
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const profiles = JSON.parse(localStorage.getItem('farmified_profiles')) || [];
    const user = profiles.find(p => p.email === formData.email && p.password === formData.password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/'); // redirect to Home
    } else {
      setLoginError('Invalid email or password');
    }
  };

  return (
    <div className="signup-container">
      <h1>Farmified</h1>
      <div className="mode-toggle">
        <button className={mode==='signup'?'active':''} onClick={()=>setMode('signup')}>Sign Up</button>
        <button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Login</button>
      </div>

      {mode === 'signup' && <>
        {/* User Type */}
        <div className="user-type-selection">
          <button className={userType==='farmer'?'active':''} onClick={()=>setUserType('farmer')}>Farmer</button>
          <button className={userType==='consumer'?'active':''} onClick={()=>setUserType('consumer')}>Consumer</button>
        </div>

        {userType && (
          <form onSubmit={handleSignup} className="signup-form">
            <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
            <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
            <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
            <input name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />

            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} required />

            {userType==='farmer' && <>
              <input name="farmName" placeholder="Farm Name" value={formData.farmName} onChange={handleInputChange} required />
              <label>Crops Grown:</label>
              <div className="checkbox-grid">
                {nebraskaProduce.map(p => (
                  <label key={p}><input type="checkbox" name="crops" value={p} checked={formData.crops.includes(p)} onChange={handleCheckboxChange} /> {p}</label>
                ))}
              </div>
              <input name="farmSize" placeholder="Farm Size (acres)" value={formData.farmSize} onChange={handleInputChange} />
            </>}

            {userType==='consumer' && <>
              <label>Preferences:</label>
              <div className="checkbox-grid">
                {nebraskaProduce.map(p => (
                  <label key={p}><input type="checkbox" name="preferences" value={p} checked={formData.preferences.includes(p)} onChange={handleCheckboxChange} /> {p}</label>
                ))}
              </div>
              <textarea name="deliveryAddress" placeholder="Delivery Address" value={formData.deliveryAddress} onChange={handleInputChange} required />
            </>}

            <button type="submit">Sign Up</button>
          </form>
        )}
      </>}

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="login-form">
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
          <button type="submit">Login</button>
          {loginError && <p className="error-message">{loginError}</p>}
        </form>
      )}
    </div>
  );
}

export default Signup;