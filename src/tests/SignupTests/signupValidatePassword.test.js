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

describe('Signup Page - validatePassword method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should validate password with all requirements met', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'ValidPass123!' } });
    
    const requirements = screen.getAllByText(/At least 8 characters|One uppercase letter|One number|One special character/);
    expect(requirements.length).toBeGreaterThan(0);
    
    expect(passwordInput.value).toBe('ValidPass123!');
  });

  test('should detect password too short (less than 8 characters)', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'Short1!' } });
    
    const shortError = screen.getByText('At least 8 characters');
    expect(shortError).toBeInTheDocument();
    expect(passwordInput.value).toBe('Short1!');
  });

  test('should detect missing uppercase letter', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'lowercase123!' } });
    
    const uppercaseError = screen.getByText('One uppercase letter');
    expect(uppercaseError).toBeInTheDocument();
    expect(passwordInput.value).toBe('lowercase123!');
  });

  test('should detect missing number', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'NoNumberPass!' } });
    
    const numberError = screen.getByText('One number');
    expect(numberError).toBeInTheDocument();
    expect(passwordInput.value).toBe('NoNumberPass!');
  });

  test('should detect missing special character', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'NoSpecial123' } });
    
    const specialError = screen.getByText('One special character');
    expect(specialError).toBeInTheDocument();
    expect(passwordInput.value).toBe('NoSpecial123');
  });

  test('should validate password with multiple errors', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'short' } });
    
    const errors = [
      screen.getByText('At least 8 characters'),
      screen.getByText('One uppercase letter'),
      screen.getByText('One number'),
      screen.getByText('One special character')
    ];
    errors.forEach(error => expect(error).toBeInTheDocument());
    expect(passwordInput.value).toBe('short');
  });
});

