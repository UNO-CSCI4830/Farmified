import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Forgot Password Page - handleInputChange method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should update forgot password email input value', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('should update email input with different email addresses', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'user1@example.com' } 
    });
    expect(emailInput.value).toBe('user1@example.com');
    
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'user2@example.com' } 
    });
    expect(emailInput.value).toBe('user2@example.com');
  });

  test('should clear email input when value is empty', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    expect(emailInput.value).toBe('test@example.com');
    
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: '' } 
    });
    expect(emailInput.value).toBe('');
  });

  test('should handle email input with special characters', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    const emailWithSpecialChars = 'user+tag@example-domain.com';
    
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: emailWithSpecialChars } 
    });
    
    expect(emailInput.value).toBe(emailWithSpecialChars);
  });

  test('should maintain email input value during form interactions', () => {
    renderWithRouter(<Signup />);
    navigateToForgotPassword();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { 
      target: { name: 'forgotPasswordEmail', value: 'test@example.com' } 
    });
    
    const submitButton = screen.getByText('Send Password');
    expect(submitButton).toBeInTheDocument();
    expect(emailInput.value).toBe('test@example.com');
  });
});

