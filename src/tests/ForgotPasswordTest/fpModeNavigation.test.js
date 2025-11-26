import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../../Pages/Signup';
import * as api from '../../utils/api';

jest.mock('../../utils/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.window.dispatchEvent = jest.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const navigateToForgotPassword = () => {
  let forgotPasswordLink = screen.queryByText('Forgot Password?');
  if (!forgotPasswordLink) {
    const modeToggle = document.querySelector('.mode-toggle');
    if (modeToggle) {
      const loginToggleButton = Array.from(modeToggle.querySelectorAll('button')).find(
        btn => btn.textContent === 'Login'
      );
      if (loginToggleButton) {
        fireEvent.click(loginToggleButton);
      }
    }
  }
  forgotPasswordLink = screen.getByText('Forgot Password?');
  fireEvent.click(forgotPasswordLink);
};

describe('Forgot Password Page - mode navigation methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should navigate from login to forgot password mode', () => {
    renderWithRouter(<Signup />);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    
    const forgotPasswordLink = screen.getByText('Forgot Password?');
    fireEvent.click(forgotPasswordLink);
    
    expect(screen.getByText(/Enter your email address and we'll send you your password/i)).toBeInTheDocument();
    expect(screen.getByText('Send Password')).toBeInTheDocument();
  });

  test('should navigate back to login from forgot password form', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    expect(screen.getByText('Send Password')).toBeInTheDocument();
    
    const backToLoginButton = screen.getByText('Back to Login');
    fireEvent.click(backToLoginButton);
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.queryByText('Send Password')).not.toBeInTheDocument();
  });

  test('should navigate to password sent confirmation after successful submission', async () => {
    api.forgotPassword.mockResolvedValue({ message: 'Success' });
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
      expect(screen.getByText(/Your password has been successfully sent to your email address/i)).toBeInTheDocument();
    });
  });

  test('should navigate back to login from password sent confirmation', async () => {
    api.forgotPassword.mockResolvedValue({ message: 'Success' });
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
    });
    
    const backToLoginButton = screen.getByText('Back to Login');
    fireEvent.click(backToLoginButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });
  });

  test('should not show forgot password form when in signup mode', () => {
    renderWithRouter(<Signup />);
    
    expect(screen.getByText('Farmer')).toBeInTheDocument();
    expect(screen.getByText('Consumer')).toBeInTheDocument();
    expect(screen.queryByText('Send Password')).not.toBeInTheDocument();
  });
});

