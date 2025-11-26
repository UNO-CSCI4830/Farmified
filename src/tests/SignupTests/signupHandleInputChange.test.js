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

describe('Signup Page - handleInputChange method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should update text input value', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const firstNameInput = screen.getByPlaceholderText('First Name');
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'John' } });
    
    expect(firstNameInput.value).toBe('John');
  });

  test('should update email input value', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { name: 'email', type: 'email', value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('should update password and trigger validation', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'NewPass123!' } });
    
    expect(passwordInput.value).toBe('NewPass123!');
    expect(screen.getByText('Password Requirements:')).toBeInTheDocument();
  });

  test('should handle select-multiple input type', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    expect(cornCheckbox).toBeInTheDocument();
    
    fireEvent.click(cornCheckbox);
    expect(cornCheckbox.checked).toBe(true);
  });

  test('should update phone number input', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '1234567890' } });
    
    expect(phoneInput.value).toBe('1234567890');
  });

  test('should update location input', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const locationInput = screen.getByPlaceholderText('Location');
    fireEvent.change(locationInput, { target: { name: 'location', value: 'Omaha, NE' } });
    
    expect(locationInput.value).toBe('Omaha, NE');
  });
});

