import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

// ✅ Mock all pages/components so App routing is easy to test
jest.mock("../components/Home", () => () => <div>HOME_PAGE</div>);
jest.mock("../components/Login", () => () => <div>LOGIN_PAGE</div>);
jest.mock("../components/Register", () => () => <div>REGISTER_PAGE</div>);
jest.mock("../components/About", () => () => <div>ABOUT_PAGE</div>);
jest.mock("../components/Contact", () => () => <div>CONTACT_PAGE</div>);
jest.mock("../components/Books", () => () => <div>BOOKS_PAGE</div>);
jest.mock("../components/Search", () => () => <div>SEARCH_PAGE</div>);
jest.mock("../components/BookDetails", () => () => <div>BOOK_DETAILS_PAGE</div>);
jest.mock("../components/Profile", () => () => <div>PROFILE_PAGE</div>);

// Navbar/Footer only show when user exists
jest.mock("../components/Navbar", () => () => <div>NAVBAR</div>);
jest.mock("../components/Footer", () => () => <div>FOOTER</div>);

describe("App Routing", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("renders Home route (/) by default", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(await screen.findByText("HOME_PAGE")).toBeInTheDocument();
  });

  test("renders Login route (/login)", async () => {
    window.history.pushState({}, "", "/login");
    render(<App />);

    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
  });

  test("renders Register route (/register)", async () => {
    window.history.pushState({}, "", "/register");
    render(<App />);

    expect(await screen.findByText("REGISTER_PAGE")).toBeInTheDocument();
  });

  test("renders About route (/about)", async () => {
    window.history.pushState({}, "", "/about");
    render(<App />);

    expect(await screen.findByText("ABOUT_PAGE")).toBeInTheDocument();
  });

  test("renders Contact route (/contact)", async () => {
    window.history.pushState({}, "", "/contact");
    render(<App />);

    expect(await screen.findByText("CONTACT_PAGE")).toBeInTheDocument();
  });

  test("protected route: /books redirects to Login when user is not logged in", async () => {
    window.history.pushState({}, "", "/books");
    render(<App />);

    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
    expect(screen.queryByText("BOOKS_PAGE")).not.toBeInTheDocument();
  });

  test("protected route: /search redirects to Login when user is not logged in", async () => {
    window.history.pushState({}, "", "/search");
    render(<App />);

    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
    expect(screen.queryByText("SEARCH_PAGE")).not.toBeInTheDocument();
  });

  test("protected route: /profile redirects to Login when user is not logged in", async () => {
    window.history.pushState({}, "", "/profile");
    render(<App />);

    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
    expect(screen.queryByText("PROFILE_PAGE")).not.toBeInTheDocument();
  });

  test("if token exists and profile API returns ok, user becomes logged in and Navbar/Footer show", async () => {
    localStorage.setItem("token", "test-token");
    window.history.pushState({}, "", "/");

    // ✅ mock fetch success
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 1, name: "Vaish" } }),
    });

    render(<App />);

    // HOME should render
    expect(await screen.findByText("HOME_PAGE")).toBeInTheDocument();

    // wait for token verification to update user
    await waitFor(() => {
      expect(screen.getByText("NAVBAR")).toBeInTheDocument();
      expect(screen.getByText("FOOTER")).toBeInTheDocument();
    });

    // verify fetch called with Authorization header
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/auth/profile",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  test("if token exists and profile API fails, token is removed and Navbar/Footer do not show", async () => {
    localStorage.setItem("token", "bad-token");
    window.history.pushState({}, "", "/");

    // ✅ mock fetch fail
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    render(<App />);

    expect(await screen.findByText("HOME_PAGE")).toBeInTheDocument();

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
    });

    expect(screen.queryByText("NAVBAR")).not.toBeInTheDocument();
    expect(screen.queryByText("FOOTER")).not.toBeInTheDocument();
  });
});
