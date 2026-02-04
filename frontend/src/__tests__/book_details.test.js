import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import BookDetails from "../components/BookDetails"; // adjust path if needed
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

// mock navigate + params
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

describe("BookDetails Component", () => {
  const mockUser = { id: 1, name: "Vaish" };

  const renderBookDetails = (user = mockUser) =>
    render(
      <MemoryRouter>
        <BookDetails user={user} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    mockUseParams.mockReturnValue({ id: "1" }); // default id
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  test("redirects to /login if user is not present", () => {
    renderBookDetails(null);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows loading state initially", async () => {
    // keep book request pending so loading stays visible
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // /books/:id pending
    axios.get.mockResolvedValueOnce({ data: { recommendations: [] } }); // /recommendations

    renderBookDetails();

    expect(await screen.findByText(/loading book details/i)).toBeInTheDocument();
  });

  test("renders book details when API succeeds", async () => {
    localStorage.setItem("token", "tok");

    axios.get.mockImplementation((url) => {
      if (url.includes("/books/1")) {
        return Promise.resolve({
          data: {
            book: {
              id: 1,
              title: "The Book",
              author: "Author A",
              genre: "Fiction",
              rating: 4.6,
              page_count: 250,
              published_year: 2020,
              isbn: "ISBN123",
              description: "A nice book",
            },
          },
        });
      }

      if (url.includes("/recommendations")) {
        return Promise.resolve({
          data: {
            recommendations: [],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    renderBookDetails();

    expect(await screen.findByText("The Book")).toBeInTheDocument();
    expect(screen.getByText(/by author a/i)).toBeInTheDocument();
    expect(screen.getByText(/fiction/i)).toBeInTheDocument();
    expect(screen.getByText(/pages/i)).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("ISBN123")).toBeInTheDocument();
    expect(screen.getByText(/about this book/i)).toBeInTheDocument();
    expect(screen.getByText(/a nice book/i)).toBeInTheDocument();
  });

  test("Back to Books button navigates to /books", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        book: {
          id: 1,
          title: "The Book",
          author: "Author A",
          genre: "Fiction",
          rating: 4.0,
          page_count: 100,
          published_year: 2019,
          isbn: "X",
          description: "Desc",
        },
      },
    });
    axios.get.mockResolvedValueOnce({ data: { recommendations: [] } });

    const user = userEvent.setup();
    renderBookDetails();

    // wait for title to appear
    expect(await screen.findByText("The Book")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to books/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/books");
  });

  test("shows 'Book not found' when book API fails and back button works", async () => {
    axios.get.mockRejectedValueOnce(new Error("Not found")); // /books/:id fails
    axios.get.mockResolvedValueOnce({ data: { recommendations: [] } });

    const user = userEvent.setup();
    renderBookDetails();

    expect(await screen.findByText(/book not found/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back to books/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/books");
  });

  test("renders recommended books (filters current id) and navigates on click", async () => {
    localStorage.setItem("token", "tok");

    axios.get.mockImplementation((url, config) => {
      if (url.includes("/books/1")) {
        return Promise.resolve({
          data: {
            book: {
              id: 1,
              title: "The Book",
              author: "Author A",
              genre: "Fiction",
              rating: 4.6,
              page_count: 250,
              published_year: 2020,
              isbn: "ISBN123",
              description: "A nice book",
            },
          },
        });
      }

      if (url.includes("/recommendations")) {
        // verify token header
        expect(config?.headers?.Authorization).toBe("Bearer tok");

        return Promise.resolve({
          data: {
            recommendations: [
              { id: 1, title: "Same Book", author: "X", genre: "X", rating: 4.0 }, // should be filtered out
              { id: 2, title: "Rec 2", author: "B", genre: "Mystery", rating: 4.4 },
              { id: 3, title: "Rec 3", author: "C", genre: "Drama", rating: 4.2 },
            ],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    const user = userEvent.setup();
    renderBookDetails();

    expect(await screen.findByText("The Book")).toBeInTheDocument();

    // section should appear
    expect(await screen.findByText(/you might also like/i)).toBeInTheDocument();

    // current book is filtered; only Rec 2 and Rec 3 should show
    expect(screen.getByText("Rec 2")).toBeInTheDocument();
    expect(screen.getByText("Rec 3")).toBeInTheDocument();
    expect(screen.queryByText("Same Book")).not.toBeInTheDocument();

    // click on a recommended card title (click bubbles to card)
    await user.click(screen.getByText("Rec 2"));
    expect(mockNavigate).toHaveBeenCalledWith("/book/2");
  });

  test("rating a book calls API, shows alert, and shows feedback text", async () => {
    localStorage.setItem("token", "tok");

    axios.get.mockResolvedValueOnce({
      data: {
        book: {
          id: 1,
          title: "The Book",
          author: "Author A",
          genre: "Fiction",
          rating: 4.2,
          page_count: 100,
          published_year: 2018,
          isbn: "Z",
          description: "Desc",
        },
      },
    });
    axios.get.mockResolvedValueOnce({ data: { recommendations: [] } });

    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

    const user = userEvent.setup();
    renderBookDetails();

    expect(await screen.findByText("The Book")).toBeInTheDocument();

    // there are 5 star buttons (all with title "Rate X stars")
    const rate3 = screen.getByTitle(/rate 3 stars/i);
    await user.click(rate3);

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    const [url, payload, config] = axios.post.mock.calls[0];
    expect(url).toMatch(/\/recommendations\/rate$/);
    expect(payload).toEqual({ bookId: 1, rating: 3 });
    expect(config.headers.Authorization).toBe("Bearer tok");

    expect(window.alert).toHaveBeenCalledWith("Book rated successfully!");
    expect(await screen.findByText(/you rated this book 3 stars/i)).toBeInTheDocument();
  });

  test("shows error alert when rating fails", async () => {
    localStorage.setItem("token", "tok");

    axios.get.mockResolvedValueOnce({
      data: {
        book: {
          id: 1,
          title: "The Book",
          author: "Author A",
          genre: "Fiction",
          rating: 4.2,
          page_count: 100,
          published_year: 2018,
          isbn: "Z",
          description: "Desc",
        },
      },
    });
    axios.get.mockResolvedValueOnce({ data: { recommendations: [] } });

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Rating failed" } },
    });

    const user = userEvent.setup();
    renderBookDetails();

    expect(await screen.findByText("The Book")).toBeInTheDocument();

    await user.click(screen.getByTitle(/rate 5 stars/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Rating failed");
    });
  });
});
