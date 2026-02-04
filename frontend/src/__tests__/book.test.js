import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import Books from "../components/Books";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Books Component", () => {
  const mockSetUser = jest.fn();
  const mockUser = { id: 1, name: "Vaish" };

  const renderBooks = (user = mockUser) =>
    render(
      <MemoryRouter>
        <Books user={user} setUser={mockSetUser} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  test("redirects to /login if user is not present", async () => {
    renderBooks(null);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("shows loading text while fetching books", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) return new Promise(() => {}); // pending
      if (url.includes("/recommendations"))
        return Promise.resolve({ data: { recommendations: [] } });
      return Promise.resolve({ data: {} });
    });

    renderBooks();

    expect(await screen.findByText(/loading books/i)).toBeInTheDocument();
  });

  test("fetches books and renders All Books by default", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) {
        return Promise.resolve({
          data: {
            books: [
              {
                id: 1,
                title: "Book One",
                author: "Author A",
                genre: "Fiction",
                description: "Desc 1",
                rating: 4.2,
              },
            ],
          },
        });
      }
      if (url.includes("/recommendations"))
        return Promise.resolve({ data: { recommendations: [] } });

      return Promise.resolve({ data: {} });
    });

    renderBooks();

    expect(await screen.findByText(/all books/i)).toBeInTheDocument();
    expect(screen.getByText("Book One")).toBeInTheDocument();
    expect(screen.getByText(/by author a/i)).toBeInTheDocument();
  });

  test("switches to Recommendations tab and renders recommendations", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) return Promise.resolve({ data: { books: [] } });

      if (url.includes("/recommendations")) {
        return Promise.resolve({
          data: {
            recommendations: [
              {
                id: 10,
                title: "Recommended Book",
                author: "Rec Author",
                genre: "Sci-Fi",
                description: "Nice",
                rating: 4.9,
              },
            ],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    const user = userEvent.setup();
    renderBooks();

    await user.click(screen.getByRole("button", { name: /recommendations/i }));

    expect(await screen.findByText(/recommended for you/i)).toBeInTheDocument();
    expect(screen.getByText("Recommended Book")).toBeInTheDocument();
  });

  test("shows no recommendations message when recommendations are empty", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) return Promise.resolve({ data: { books: [] } });
      if (url.includes("/recommendations"))
        return Promise.resolve({ data: { recommendations: [] } });
      return Promise.resolve({ data: {} });
    });

    const user = userEvent.setup();
    renderBooks();

    await user.click(screen.getByRole("button", { name: /recommendations/i }));

    expect(
      await screen.findByText(/no recommendations yet/i)
    ).toBeInTheDocument();
  });

  test("navigates to book details when clicking View Details button", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) {
        return Promise.resolve({
          data: {
            books: [
              {
                id: 5,
                title: "Book Five",
                author: "A5",
                genre: "Drama",
                description: "D5",
                rating: 4.1,
              },
            ],
          },
        });
      }
      if (url.includes("/recommendations"))
        return Promise.resolve({ data: { recommendations: [] } });

      return Promise.resolve({ data: {} });
    });

    const user = userEvent.setup();
    renderBooks();

    expect(await screen.findByText("Book Five")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /view details/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/book/5");
  });

  test("rates a book successfully and shows success alert", async () => {
    localStorage.setItem("token", "rate-token");

    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) {
        return Promise.resolve({
          data: {
            books: [
              {
                id: 7,
                title: "Rate Me",
                author: "Auth",
                genre: "G",
                description: "D",
                rating: 3.8,
              },
            ],
          },
        });
      }
      if (url.includes("/recommendations"))
        return Promise.resolve({ data: { recommendations: [] } });

      return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

    const user = userEvent.setup();
    renderBooks();

    expect(await screen.findByText("Rate Me")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "5" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    const [url, payload, config] = axios.post.mock.calls[0];
    expect(url).toMatch(/\/recommendations\/rate$/);
    expect(payload).toEqual({ bookId: 7, rating: 5 });
    expect(config.headers.Authorization).toBe("Bearer rate-token");

    expect(window.alert).toHaveBeenCalledWith("Book rated successfully!");
  });

  test("shows error alert when rating fails", async () => {
    localStorage.setItem("token", "tok");

    axios.get.mockImplementation((url) => {
      if (url.includes("/books")) {
        return Promise.resolve({
          data: {
            books: [
              {
                id: 8,
                title: "Fail Rate",
                author: "Auth",
                genre: "G",
                description: "D",
                rating: 3.0,
              },
            ],
          },
        });
      }
      if (url.includes("/recommendations"))
        return Promise.resolve({ data: { recommendations: [] } });

      return Promise.resolve({ data: {} });
    });

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Rating not allowed" } },
    });

    const user = userEvent.setup();
    renderBooks();

    expect(await screen.findByText("Fail Rate")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "1" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Rating not allowed");
    });
  });
});
