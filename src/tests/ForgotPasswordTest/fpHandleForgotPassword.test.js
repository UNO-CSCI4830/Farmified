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

describe('Forgot Password Page - handleForgotPassword method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should successfully submit forgot password form', async () => {
    api.forgotPassword.mockResolvedValue({ message: 'Password sent successfully' });
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(api.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    await waitFor(() => {
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Your password has been successfully sent to your email address/i)).toBeInTheDocument();
  });

  test('should show error message when forgot password API fails', async () => {
    const errorMessage = 'Email not found';
    api.forgotPassword.mockRejectedValue(new Error(errorMessage));
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'nonexistent@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(api.forgotPassword).toHaveBeenCalledWith('nonexistent@example.com');
    });
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('should show generic error message when API fails without specific message', async () => {
    api.forgotPassword.mockRejectedValue(new Error());
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to send password. Please try again/i)).toBeInTheDocument();
    });
  });

  test('should handle network error gracefully', async () => {
    const networkError = new Error('Failed to fetch');
    networkError.message = 'Failed to fetch';
    api.forgotPassword.mockRejectedValue(networkError);
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      const errorMessage = screen.queryByText(/Failed to send password|Cannot connect to server|Failed to fetch/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should clear error message on new submission attempt', async () => {
    api.forgotPassword.mockRejectedValueOnce(new Error('First error'));
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });
    
    api.forgotPassword.mockResolvedValueOnce({ message: 'Success' });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
    });
  });
});

