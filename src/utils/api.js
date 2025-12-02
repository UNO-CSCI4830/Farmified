// API utility functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Signup failed' }));
      throw new Error(errorData.error || `Signup failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Provide more specific error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errorData.error || `Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Provide more specific error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to process request' }));
      throw new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
};

// src/utils/api.js added by Eric 12/1
export const updateUser = async (id, data) => {
  const res = await fetch(`http://localhost:5001/api/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update user');
  }
  return res.json();
};

