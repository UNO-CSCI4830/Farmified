import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../components/Sidebar.js";

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

beforeEach(() => {
  mockedNavigate.mockReset();
  localStorage.clear();
});


// TEST #1: Renders basic static links
test("TEST1 renders main navigation links", () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  expect(screen.getByText("Farmified")).toBeInTheDocument();
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(screen.getByText("Messages")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
});


// TEST #2: Shows dropdown on hover
test("TEST2 shows Database dropdown when hovered", () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  const databaseTitle = screen.getByText("Database");

  // Hover over Database
  fireEvent.mouseEnter(databaseTitle);

  expect(screen.getByText("Add Entry")).toBeInTheDocument();
  expect(screen.getByText("View Records")).toBeInTheDocument();
  expect(screen.getByText("Export Data")).toBeInTheDocument();

  // Unhover (dropdown should hide)
  fireEvent.mouseLeave(databaseTitle);

  expect(screen.queryByText("Add Entry")).not.toBeInTheDocument();
});


// TEST #3: Shows Sign Out button when user logged in
test("TEST3 displays Sign Out button only when user exists", () => {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ firstName: "Eric", lastName: "Gonzalez" })
  );

  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  expect(screen.getByText("Sign Out")).toBeInTheDocument();
});


// TEST #4: Clicking Sign Out clears userdata and navigates to /signup
test("TEST4 sign out clears localStorage and navigates to signup", () => {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ firstName: "Eric", lastName: "Gonzalez" })
  );

  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText("Sign Out"));

  expect(localStorage.getItem("currentUser")).toBe(null);
  expect(mockedNavigate).toHaveBeenCalledWith("/signup");
});