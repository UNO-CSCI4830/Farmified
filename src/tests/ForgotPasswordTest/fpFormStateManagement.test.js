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

describe('Forgot Password Page - form state management methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should disable submit button while loading', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    api.forgotPassword.mockReturnValue(promise);
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
    
    const sendingButton = screen.getByText('Sending...');
    expect(sendingButton).toBeDisabled();
    
    resolvePromise({ message: 'Success' });
    
    await waitFor(() => {
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
    });
  });

  test('should clear forgot password email when navigating back from password sent', async () => {
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
    
    const forgotPasswordLinkAgain = screen.getByText('Forgot Password?');
    fireEvent.click(forgotPasswordLinkAgain);
    
    const emailInputAgain = screen.getByPlaceholderText('Email');
    expect(emailInputAgain.value).toBe('');
  });

  test('should show loading state during API call', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    api.forgotPassword.mockReturnValue(promise);
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(screen.queryByText('Send Password')).not.toBeInTheDocument();
    });
    
    resolvePromise({ message: 'Success' });
    
    await waitFor(() => {
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
    });
  });

  test('should clear error state when submitting new form after error', async () => {
    api.forgotPassword.mockRejectedValueOnce(new Error('Test error'));
    
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
    
    api.forgotPassword.mockResolvedValueOnce({ message: 'Success' });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
      expect(screen.getByText('Password Sent!')).toBeInTheDocument();
    });
  });

  test('should maintain form state during mode switches', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const backToLoginButton = screen.getByText('Back to Login');
    fireEvent.click(backToLoginButton);
    
    const forgotPasswordLink = screen.getByText('Forgot Password?');
    fireEvent.click(forgotPasswordLink);
    
    const emailInputAgain = screen.getByPlaceholderText('Email');
    expect(emailInputAgain.value).toBe('test@example.com');
  });

  test('should render forgot password form with correct initial state', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    expect(screen.getByText(/Enter your email address and we'll send you your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByText('Send Password')).toBeInTheDocument();
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
    
    const emailInput = screen.getByPlaceholderText('Email');
    expect(emailInput.value).toBe('');
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});

