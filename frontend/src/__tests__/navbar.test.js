import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Navbar from "../components/Navbar";
import { MemoryRouter } from "react-router-dom";

// mock navigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/" }),
}));

describe("Navbar Component", () => {
  const mockSetUser = jest.fn();

  const renderNavbar = (user = null) =>
    render(
      <MemoryRouter>
        <Navbar user={user} setUser={mockSetUser} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders logo and common links", () => {
    renderNavbar();

    expect(screen.getByText(/bookverse/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  test("shows Login and Sign Up when user is not logged in", () => {
    renderNavbar(null);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();

    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/books/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/profile/i)).not.toBeInTheDocument();
  });

  test("shows user-specific links when user is logged in", () => {
    renderNavbar({ id: 1, name: "Vaish" });

    expect(screen.getByText(/books/i)).toBeInTheDocument();
    expect(screen.getByText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();

    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
  });

  test("hamburger menu toggles open and close", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const hamburger = screen.getByRole("button");

    await user.click(hamburger);
    expect(document.querySelector(".nav-menu")).toHaveClass("active");

    await user.click(hamburger);
    expect(document.querySelector(".nav-menu")).not.toHaveClass("active");
  });

  test("logout clears token, calls setUser(null), and navigates to home", async () => {
    localStorage.setItem("token", "test-token");

    const user = userEvent.setup();
    renderNavbar({ id: 1, name: "Vaish" });

    await user.click(screen.getByText(/logout/i));

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
