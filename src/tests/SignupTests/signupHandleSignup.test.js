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

describe('Signup Page - handleSignup method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should show error when passwords do not match', async () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'DifferentPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Farm Name'), { 
      target: { name: 'farmName', value: 'Test Farm' } 
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    fireEvent.click(cornCheckbox);
    
    const form = screen.getByPlaceholderText('Farm Name').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
  });

  test('should show error when password does not meet requirements', async () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'weak' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'weak' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Farm Name'), { 
      target: { name: 'farmName', value: 'Test Farm' } 
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    fireEvent.click(cornCheckbox);
    
    const form = screen.getByPlaceholderText('Farm Name').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Password does not meet requirements/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should show error when farmer does not select crops', async () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Farm Name'), { 
      target: { name: 'farmName', value: 'Test Farm' } 
    });
    

    const form = screen.getByPlaceholderText('Farm Name').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Select at least one crop/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should successfully submit signup form for farmer', async () => {
    const mockUser = { id: 1, email: 'john@example.com', firstName: 'John' };
    api.signup.mockResolvedValue({ user: mockUser });
    
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Farm Name'), { 
      target: { name: 'farmName', value: 'Test Farm' } 
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    fireEvent.click(cornCheckbox);
    
    const form = screen.getByPlaceholderText('Farm Name').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          userType: 'farmer',
          farmName: 'Test Farm',
          crops: ['Corn']
        })
      );
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  test('should successfully submit signup form for consumer', async () => {
    const mockUser = { id: 2, email: 'jane@example.com', firstName: 'Jane' };
    api.signup.mockResolvedValue({ user: mockUser });
    
    renderWithRouter(<Signup />);
    
    const consumerButton = screen.getByText('Consumer');
    fireEvent.click(consumerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'Jane' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'jane@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Delivery Address'), { 
      target: { name: 'deliveryAddress', value: '123 Main St' } 
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const applesCheckbox = checkboxes.find(cb => cb.value === 'Apples');
    fireEvent.click(applesCheckbox);
    
    const form = screen.getByPlaceholderText('Delivery Address').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          userType: 'consumer',
          deliveryAddress: '123 Main St',
          preferences: ['Apples']
        })
      );
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  test('should show error message when signup API fails', async () => {
    const errorMessage = 'Email already exists';
    api.signup.mockRejectedValue(new Error(errorMessage));
    
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Farm Name'), { 
      target: { name: 'farmName', value: 'Test Farm' } 
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    fireEvent.click(cornCheckbox);
    
    const form = screen.getByPlaceholderText('Farm Name').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should show error when consumer does not select preferences', async () => {
    renderWithRouter(<Signup />);
    
    const consumerButton = screen.getByText('Consumer');
    fireEvent.click(consumerButton);
    
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { name: 'firstName', value: 'Jane' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { name: 'lastName', value: 'Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { name: 'email', value: 'jane@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { 
      target: { name: 'phone', value: '1234567890' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), { 
      target: { name: 'location', value: 'Omaha' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { name: 'password', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { 
      target: { name: 'confirmPassword', value: 'ValidPass123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Delivery Address'), { 
      target: { name: 'deliveryAddress', value: '123 Main St' } 
    });
    
    const form = screen.getByPlaceholderText('Delivery Address').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Select at least one preference/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

