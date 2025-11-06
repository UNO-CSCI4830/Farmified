// src/Pages/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup as signupAPI, login as loginAPI } from '../utils/api';
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
  const [passwordErrors, setPasswordErrors] = useState(['At least 8 characters', 'One uppercase letter', 'One number', 'One special character']);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    
    if (!userType) {
      setSignupError('Please select Farmer or Consumer');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setSignupError("Passwords don't match");
      return;
    }
    const pwErrors = validatePassword(formData.password);
    if (pwErrors.length) {
      setSignupError('Password does not meet requirements');
      return;
    }
    if (userType === 'farmer' && formData.crops.length === 0) {
      setSignupError('Select at least one crop');
      return;
    }
    if (userType === 'consumer' && formData.preferences.length === 0) {
      setSignupError('Select at least one preference');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
        userType,
        ...(userType === 'farmer' && {
          farmName: formData.farmName,
          crops: formData.crops,
          farmSize: formData.farmSize
        }),
        ...(userType === 'consumer' && {
          preferences: formData.preferences,
          deliveryAddress: formData.deliveryAddress
        })
      };

      const response = await signupAPI(userData);
      
      // Store user in localStorage for frontend state management
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('userLoggedIn'));
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      setSignupError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await loginAPI(formData.email, formData.password);
      
      // Store user in localStorage for frontend state management
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('userLoggedIn'));
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      setLoginError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
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

            <div>
              <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
              <div className="password-requirements">
                <p>Password Requirements:</p>
                <ul>
                  {['At least 8 characters', 'One uppercase letter', 'One number', 'One special character'].map((req) => {
                    const isMet = !passwordErrors.includes(req);
                    return (
                      <li key={req} className={isMet ? 'met' : ''}>
                        {req}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
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

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
            {signupError && <p className="error-message">{signupError}</p>}
          </form>
        )}
      </>}

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="login-form">
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
          {loginError && <p className="error-message">{loginError}</p>}
        </form>
      )}
    </div>
  );
}

export default Signup;