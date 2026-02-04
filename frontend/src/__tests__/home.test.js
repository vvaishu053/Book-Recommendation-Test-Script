// src/__tests__/home.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Home from "../components/Home";

// mock useNavigate (no router needed)
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders title and subtitle", () => {
    render(<Home user={null} />);

    expect(screen.getByText("Book Recommendation System")).toBeInTheDocument();
    expect(screen.getByText("Discover Your Next Favorite Book")).toBeInTheDocument();
  });

  test("shows Sign In and Create Account buttons when user is not present", () => {
    render(<Home user={null} />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  test("navigates to /login when clicking Sign In", async () => {
    const user = userEvent.setup();
    render(<Home user={null} />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("navigates to /register when clicking Create Account", async () => {
    const user = userEvent.setup();
    render(<Home user={null} />);

    await user.click(screen.getByRole("button", { name: "Create Account" }));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  test("does not show Sign In / Create Account buttons when user is present", () => {
    render(<Home user={{ id: 1, name: "Vaish" }} />);

    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create Account" })
    ).not.toBeInTheDocument();
  });

  test("shows stats section when user is present", () => {
    render(<Home user={{ id: 1, name: "Vaish" }} />);

    expect(screen.getByText("10K+")).toBeInTheDocument();
    expect(screen.getByText("Books Available")).toBeInTheDocument();

    expect(screen.getByText("50K+")).toBeInTheDocument();
    expect(screen.getByText("Active Readers")).toBeInTheDocument();

    expect(screen.getByText("100K+")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
  });

  test("renders feature section content", () => {
    render(<Home user={null} />);

    expect(screen.getByText("Why Choose BookVerse?")).toBeInTheDocument();
    expect(screen.getByText("Discover")).toBeInTheDocument();
    expect(screen.getByText("Rate & Review")).toBeInTheDocument();
    expect(screen.getByText("Smart Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
  });
});
