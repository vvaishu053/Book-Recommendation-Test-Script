import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import Register from "../components/Register"; // adjust path if needed
import { MemoryRouter } from "react-router-dom";
import { act } from "react";

jest.mock("axios");

// mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // prevent timer leaks
  });

  const renderRegister = (user = null) => {
    return render(
      <MemoryRouter>
        <Register user={user} />
      </MemoryRouter>
    );
  };

  const fillForm = async (
    user,
    {
      name = "John Doe",
      email = "john@example.com",
      password = "Password@123",
      confirmPassword = "Password@123",
    } = {}
  ) => {
    await user.type(screen.getByLabelText(/full name/i), name);
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/^password$/i), password);
    await user.type(screen.getByLabelText(/confirm password/i), confirmPassword);
  };

  // ---------------- Rendering ----------------
  test("renders register page correctly", () => {
    renderRegister();

    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/join our book community/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("redirects to home if user already logged in", () => {
    renderRegister({ id: 1, name: "John" });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // ---------------- Validation ----------------
  test("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillForm(user, {
      password: "Password@123",
      confirmPassword: "Different@123",
    });

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("shows error when password is less than 6 characters", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillForm(user, {
      password: "123",
      confirmPassword: "123",
    });

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();

    expect(axios.post).not.toHaveBeenCalled();
  });

  // ---------------- Success ----------------
  test("submits form and shows success message", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

    const user = userEvent.setup();
    renderRegister();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/registration successful! redirecting to login/i)
    ).toBeInTheDocument();
  });

  test("redirects to login after 2 seconds", async () => {
    jest.useFakeTimers();
    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    renderRegister();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/registration successful! redirecting to login/i)
    ).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");

    jest.useRealTimers();
  });

  // ---------------- Loading ----------------
  test("disables button while loading", async () => {
    let resolvePromise;
    axios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);

    const btn = screen.getByRole("button", { name: /register/i });
    await user.click(btn);

    expect(
      screen.getByRole("button", { name: /creating account/i })
    ).toBeInTheDocument();
    expect(btn).toBeDisabled();

    resolvePromise({ data: { message: "ok" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /register/i })).toBeEnabled();
    });
  });

  // ---------------- Error handling ----------------
  test("shows backend error message and does NOT redirect to login", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Email already exists" } },
    });

    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);

    // clear navigation calls BEFORE submit
    mockNavigate.mockClear();

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  test("shows generic error message if backend message missing", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: {} } });

    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/registration failed\. please try again\./i)
    ).toBeInTheDocument();
  });
});
