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

describe('Signup Page - handleCheckboxChange method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('should check a crop checkbox for farmer', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    
    expect(cornCheckbox.checked).toBe(false);
    
    fireEvent.click(cornCheckbox);
    
    expect(cornCheckbox.checked).toBe(true);
  });

  test('should uncheck a crop checkbox for farmer', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    
    fireEvent.click(cornCheckbox);
    expect(cornCheckbox.checked).toBe(true);
    
    fireEvent.click(cornCheckbox);
    expect(cornCheckbox.checked).toBe(false);
  });

  test('should check multiple crop checkboxes for farmer', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    const soybeansCheckbox = checkboxes.find(cb => cb.value === 'Soybeans');
    const wheatCheckbox = checkboxes.find(cb => cb.value === 'Wheat');
    
    fireEvent.click(cornCheckbox);
    fireEvent.click(soybeansCheckbox);
    fireEvent.click(wheatCheckbox);
    
    expect(cornCheckbox.checked).toBe(true);
    expect(soybeansCheckbox.checked).toBe(true);
    expect(wheatCheckbox.checked).toBe(true);
  });

  test('should check a preference checkbox for consumer', () => {
    renderWithRouter(<Signup />);
    
    const consumerButton = screen.getByText('Consumer');
    fireEvent.click(consumerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const applesCheckbox = checkboxes.find(cb => cb.value === 'Apples');
    
    expect(applesCheckbox.checked).toBe(false);
    
    fireEvent.click(applesCheckbox);
    
    expect(applesCheckbox.checked).toBe(true);
  });

  test('should uncheck a preference checkbox for consumer', () => {
    renderWithRouter(<Signup />);
    
    const consumerButton = screen.getByText('Consumer');
    fireEvent.click(consumerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const applesCheckbox = checkboxes.find(cb => cb.value === 'Apples');
    
    fireEvent.click(applesCheckbox);
    expect(applesCheckbox.checked).toBe(true);
    
    fireEvent.click(applesCheckbox);
    expect(applesCheckbox.checked).toBe(false);
  });

  test('should check multiple preference checkboxes for consumer', () => {
    renderWithRouter(<Signup />);
    
    const consumerButton = screen.getByText('Consumer');
    fireEvent.click(consumerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const applesCheckbox = checkboxes.find(cb => cb.value === 'Apples');
    const tomatoesCheckbox = checkboxes.find(cb => cb.value === 'Tomatoes');
    const pumpkinsCheckbox = checkboxes.find(cb => cb.value === 'Pumpkins');
    
    fireEvent.click(applesCheckbox);
    fireEvent.click(tomatoesCheckbox);
    fireEvent.click(pumpkinsCheckbox);
    
    expect(applesCheckbox.checked).toBe(true);
    expect(tomatoesCheckbox.checked).toBe(true);
    expect(pumpkinsCheckbox.checked).toBe(true);
  });

  test('should handle mixed checkbox states (some checked, some unchecked)', () => {
    renderWithRouter(<Signup />);
    
    const farmerButton = screen.getByText('Farmer');
    fireEvent.click(farmerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const cornCheckbox = checkboxes.find(cb => cb.value === 'Corn');
    const soybeansCheckbox = checkboxes.find(cb => cb.value === 'Soybeans');
    const wheatCheckbox = checkboxes.find(cb => cb.value === 'Wheat');
    
    fireEvent.click(cornCheckbox);
    fireEvent.click(soybeansCheckbox);
    
    expect(cornCheckbox.checked).toBe(true);
    expect(soybeansCheckbox.checked).toBe(true);
    expect(wheatCheckbox.checked).toBe(false);
    
    fireEvent.click(cornCheckbox);
    expect(cornCheckbox.checked).toBe(false);
    expect(soybeansCheckbox.checked).toBe(true);
    expect(wheatCheckbox.checked).toBe(false);
  });
});

