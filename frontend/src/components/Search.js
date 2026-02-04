import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Search.css';

function Search({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAllBooks();
  }, [user, navigate]);

  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/books`);
      setBooks(response.data.books);
      setFilteredBooks(response.data.books);
      
      // Extract unique genres
      const uniqueGenres = [...new Set(response.data.books.map(book => book.genre))].sort();
      setGenres(uniqueGenres);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterBooks(query, selectedGenre);
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre);
    filterBooks(searchQuery, genre);
  };

  const filterBooks = (query, genre) => {
    let filtered = books;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (genre) {
      filtered = filtered.filter(book => book.genre === genre);
    }

    setFilteredBooks(filtered);
  };

  const handleRateBook = async (bookId, rating) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/recommendations/rate`,
        { bookId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Book rated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rate book');
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>🔍 Search & Filter Books</h1>
        <p>Find your next favorite book</p>
      </div>

      <div className="search-container">
        <div className="search-sidebar">
          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>Filter by Genre</h3>
            <div className="genre-list">
              <button
                className={`genre-btn ${!selectedGenre ? 'active' : ''}`}
                onClick={() => handleGenreFilter('')}
              >
                All Genres
              </button>
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                  onClick={() => handleGenreFilter(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="search-results">
          <div className="results-header">
            <h2>Results: {filteredBooks.length} books found</h2>
          </div>

          {loading ? (
            <p className="loading">Loading books...</p>
          ) : filteredBooks.length > 0 ? (
            <div className="books-grid">
              {filteredBooks.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-header">
                    <h3>{book.title}</h3>
                  </div>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-genre">{book.genre}</p>
                  <p className="book-description">{book.description}</p>
                  <p className="book-info">
                    <span>📄 {book.page_count} pages</span>
                    <span>📅 {book.published_year}</span>
                  </p>
                  <p className="book-rating">⭐ {book.rating.toFixed(1)}</p>
                  <div className="rating-buttons">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        className="rate-btn"
                        onClick={() => handleRateBook(book.id, rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No books found matching your criteria.</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
