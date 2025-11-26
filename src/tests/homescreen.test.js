import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../Pages/Home.js";

// Mock useNavigate from react-router
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

// Reset mocks + localStorage before each test
beforeEach(() => {
  mockedNavigate.mockReset();
  localStorage.clear();
});

// TEST #1: Renders page title
test("TEST1 renders Farmified header", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByText("Farmified")).toBeInTheDocument();
});

// TEST #2: Shows Sign Up/Login button when no user in localStorage
test("TEST2 shows Sign Up/Login button when user is not logged in", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByText("Sign Up / Login")).toBeInTheDocument();
});

// TEST #3: Shows user greeting when user IS logged in
test("TEST3 shows greeting when user exists in localStorage", () => {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ firstName: "Eric", lastName: "Gonzalez" })
  );

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByText("Hello Eric Gonzalez")).toBeInTheDocument();
});

// TEST #4: Navigate to signup page when Sign Up/Login clicked
test("TEST4 navigates to /signup when Sign Up/Login button clicked", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText("Sign Up / Login"));

  expect(mockedNavigate).toHaveBeenCalledWith("/signup");
});