import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import Profile from "../components/Profile"; // adjust path if needed
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

// mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Profile Component", () => {
  const mockUser = { id: 1, name: "Vaish", email: "vaish@gmail.com" };

  const renderProfile = (user = mockUser) =>
    render(
      <MemoryRouter>
        <Profile user={user} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("redirects to /login if user is not present", () => {
    renderProfile(null);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("renders user basic info (name & email)", async () => {
    axios.get.mockResolvedValueOnce({ data: { ratings: [] } });
    localStorage.setItem("token", "tok");

    renderProfile();

    expect(await screen.findByText("Vaish")).toBeInTheDocument();
    expect(screen.getByText("vaish@gmail.com")).toBeInTheDocument();
  });

  test("shows loading text while fetching ratings", async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // keep pending
    localStorage.setItem("token", "tok");

    renderProfile();

    expect(await screen.findByText(/loading your ratings/i)).toBeInTheDocument();
  });

  test("fetches ratings with token and shows stats + rating list", async () => {
    localStorage.setItem("token", "token-123");

    axios.get.mockResolvedValueOnce({
      data: {
        ratings: [
          {
            id: 1,
            title: "Book One",
            author: "Author A",
            genre: "Fiction",
            rating: 5,
          },
          {
            id: 2,
            title: "Book Two",
            author: "Author B",
            genre: "Mystery",
            rating: 3,
          },
        ],
      },
    });

    renderProfile();

    // verify API call + auth header
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    const [url, config] = axios.get.mock.calls[0];
    expect(url).toMatch(/\/recommendations\/user-ratings$/);
    expect(config.headers.Authorization).toBe("Bearer token-123");

    // stats
    // Books Rated = 2
    expect(await screen.findByText("2")).toBeInTheDocument();

    // Average rating = (5+3)/2 = 4.0
    expect(screen.getByText("4.0")).toBeInTheDocument();

    // Favorites (rating >=4) = 1
    expect(screen.getByText("1")).toBeInTheDocument();

    // list items
    expect(screen.getByText("Book One")).toBeInTheDocument();
    expect(screen.getByText(/by author a/i)).toBeInTheDocument();
    expect(screen.getByText("Fiction")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();

    expect(screen.getByText("Book Two")).toBeInTheDocument();
    expect(screen.getByText(/by author b/i)).toBeInTheDocument();
    expect(screen.getByText("Mystery")).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  test("shows 'no ratings' message when ratings list is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: { ratings: [] } });
    localStorage.setItem("token", "tok");

    renderProfile();

    expect(
      await screen.findByText(/you haven't rated any books yet/i)
    ).toBeInTheDocument();

    // stats should show 0 rated and avg 0
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  test("handles API failure gracefully (shows no ratings message)", async () => {
    axios.get.mockRejectedValueOnce(new Error("failed"));
    localStorage.setItem("token", "tok");

    renderProfile();

    // after failure, userRatings remains empty so it shows no-ratings text
    expect(
      await screen.findByText(/you haven't rated any books yet/i)
    ).toBeInTheDocument();
  });
});
