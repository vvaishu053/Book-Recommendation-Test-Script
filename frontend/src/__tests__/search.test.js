import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import axios from "axios";
import Search from "../components/Search"; // adjust path if needed
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

// mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Search Component", () => {
  const mockUser = { id: 1, name: "Vaish" };

  const mockBooks = [
    {
      id: 1,
      title: "Harry Potter",
      author: "J.K. Rowling",
      genre: "Fantasy",
      description: "Wizard school and magic",
      page_count: 400,
      published_year: 1997,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Sherlock Holmes",
      author: "Arthur Conan Doyle",
      genre: "Mystery",
      description: "Detective stories",
      page_count: 320,
      published_year: 1892,
      rating: 4.4,
    },
    {
      id: 3,
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Self-Help",
      description: "Build good habits and break bad ones",
      page_count: 280,
      published_year: 2018,
      rating: 4.6,
    },
  ];

  const renderSearch = (user = mockUser) =>
    render(
      <MemoryRouter>
        <Search user={user} />
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

  test("redirects to /login if user is not present", () => {
    renderSearch(null);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows loading while fetching books", async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // pending
    renderSearch();

    expect(await screen.findByText(/loading books/i)).toBeInTheDocument();
  });

  test("fetches books and shows initial results count", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    renderSearch();

    expect(await screen.findByText(/results:\s*3 books found/i)).toBeInTheDocument();
    expect(screen.getByText("Harry Potter")).toBeInTheDocument();
    expect(screen.getByText("Sherlock Holmes")).toBeInTheDocument();
    expect(screen.getByText("Atomic Habits")).toBeInTheDocument();

    // genres list buttons should include unique genres
    expect(screen.getByRole("button", { name: /all genres/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fantasy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mystery" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Self-Help" })).toBeInTheDocument();
  });

  test("filters books by search query (title/author/description)", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    const user = userEvent.setup();
    renderSearch();

    // wait for initial load
    expect(await screen.findByText(/results:\s*3 books found/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      /search by title, author, or keyword/i
    );

    // search by title keyword
    await user.type(searchInput, "harry");
    expect(await screen.findByText(/results:\s*1 books found/i)).toBeInTheDocument();
    expect(screen.getByText("Harry Potter")).toBeInTheDocument();
    expect(screen.queryByText("Sherlock Holmes")).not.toBeInTheDocument();

    // clear and search by author
    await user.clear(searchInput);
    await user.type(searchInput, "james");
    expect(await screen.findByText(/results:\s*1 books found/i)).toBeInTheDocument();
    expect(screen.getByText("Atomic Habits")).toBeInTheDocument();

    // clear and search by description keyword
    await user.clear(searchInput);
    await user.type(searchInput, "detective");
    expect(await screen.findByText(/results:\s*1 books found/i)).toBeInTheDocument();
    expect(screen.getByText("Sherlock Holmes")).toBeInTheDocument();
  });

  test("filters books by genre", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    const user = userEvent.setup();
    renderSearch();

    expect(await screen.findByText(/results:\s*3 books found/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mystery" }));

    expect(await screen.findByText(/results:\s*1 books found/i)).toBeInTheDocument();
    expect(screen.getByText("Sherlock Holmes")).toBeInTheDocument();
    expect(screen.queryByText("Harry Potter")).not.toBeInTheDocument();
  });

  test("applies search + genre filter together", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    const user = userEvent.setup();
    renderSearch();

    expect(await screen.findByText(/results:\s*3 books found/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      /search by title, author, or keyword/i
    );

    // genre = Fantasy
    await user.click(screen.getByRole("button", { name: "Fantasy" }));
    expect(await screen.findByText(/results:\s*1 books found/i)).toBeInTheDocument();

    // search within Fantasy
    await user.type(searchInput, "wizard");
    expect(await screen.findByText(/results:\s*1 books found/i)).toBeInTheDocument();
    expect(screen.getByText("Harry Potter")).toBeInTheDocument();

    // search mismatch -> no results
    await user.clear(searchInput);
    await user.type(searchInput, "detective");
    expect(await screen.findByText(/results:\s*0 books found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no books found matching your criteria/i)
    ).toBeInTheDocument();
  });

  test("shows no results UI when nothing matches", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    const user = userEvent.setup();
    renderSearch();

    expect(await screen.findByText(/results:\s*3 books found/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      /search by title, author, or keyword/i
    );

    await user.type(searchInput, "zzzzzz");
    expect(await screen.findByText(/results:\s*0 books found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no books found matching your criteria/i)
    ).toBeInTheDocument();
  });

  test("rates a book successfully (API call + alert)", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    localStorage.setItem("token", "rate-token");
    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });

    const user = userEvent.setup();
    renderSearch();

    expect(await screen.findByText("Harry Potter")).toBeInTheDocument();

    // click rating "5" for the first book card
    await user.click(screen.getAllByRole("button", { name: "5" })[0]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    const [url, body, config] = axios.post.mock.calls[0];
    expect(url).toMatch(/\/recommendations\/rate$/);
    expect(body).toEqual({ bookId: 1, rating: 5 });
    expect(config.headers.Authorization).toBe("Bearer rate-token");

    expect(window.alert).toHaveBeenCalledWith("Book rated successfully!");
  });

  test("shows error alert when rating fails", async () => {
    axios.get.mockResolvedValueOnce({ data: { books: mockBooks } });

    localStorage.setItem("token", "tok");
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Failed rating" } },
    });

    const user = userEvent.setup();
    renderSearch();

    expect(await screen.findByText("Harry Potter")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "1" })[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed rating");
    });
  });
});
