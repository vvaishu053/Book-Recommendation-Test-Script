import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import Login from "../components/Login";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

// Mock useNavigate only, keep other router features real
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login Component", () => {
  const mockSetUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders login page UI", () => {
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  test("shows error message on failed login", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Enter your email"), "test@gmail.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("successful login calls setUser and navigates", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        user: { id: 1, email: "test@gmail.com" },
      },
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Enter your email"), "test@gmail.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "Test@123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/books");
    });
  });

  test("token is stored in localStorage on successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token-123",
        user: { id: 1, email: "test@gmail.com" },
      },
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Enter your email"), "test@gmail.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "Test@123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token-123");
    });
  });

  test("redirects to home if user is already logged in", () => {
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={{ id: 1, name: "John" }} />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("shows generic error message when no error details provided", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: {} },
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Enter your email"), "test@gmail.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed\. Please try again\./i)).toBeInTheDocument();
    });
  });

  test("shows loading state while API request is in progress", async () => {
    let resolvePromise;
    axios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Enter your email"), "test@gmail.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password");

    const btn = screen.getByRole("button", { name: "Login" });
    await user.click(btn);

    // loading text + disabled
    expect(screen.getByRole("button", { name: /Logging in/i })).toBeInTheDocument();
    expect(btn).toBeDisabled();

    // finish promise
    resolvePromise({
      data: {
        token: "fake-token",
        user: { id: 1, email: "test@gmail.com" },
      },
    });

    // button enabled again after request finishes
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Login$/i })).toBeEnabled();
    });
  });

  test("sends correct data to API endpoint", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        user: { id: 1, email: "test@gmail.com" },
      },
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login setUser={mockSetUser} user={null} />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Enter your email"), "john@example.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "SecurePass123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        {
          email: "john@example.com",
          password: "SecurePass123",
        }
      );
    });
  });
});
