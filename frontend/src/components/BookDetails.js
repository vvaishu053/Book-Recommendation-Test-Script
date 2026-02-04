import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookDetails.css';

function BookDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendedBooks, setRecommendedBooks] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookDetails();
    fetchRecommendations();
  }, [id, user, navigate]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/${id}`);
      setBook(response.data.book);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch book details:', error);
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/recommendations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Filter out current book and get first 4
      const filtered = response.data.recommendations.filter(b => b.id !== parseInt(id)).slice(0, 4);
      setRecommendedBooks(filtered);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleRateBook = async (rating) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/recommendations/rate`,
        { bookId: parseInt(id), rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserRating(rating);
      alert('Book rated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rate book');
    }
  };

  if (loading) {
    return (
      <div className="book-details-loading">
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-error">
        <p>Book not found</p>
        <button onClick={() => navigate('/books')}>Back to Books</button>
      </div>
    );
  }

  return (
    <div className="book-details-page">
      <button className="back-btn" onClick={() => navigate('/books')}>
        ← Back to Books
      </button>

      <div className="book-details-container">
        <div className="book-details-main">
          <div className="book-cover-section">
            <div className="book-cover">
              <div className="cover-placeholder">
                <span className="book-emoji">📖</span>
              </div>
            </div>
          </div>

          <div className="book-info-section">
            <h1>{book.title}</h1>
            <p className="author">by {book.author}</p>
            <div className="book-meta">
              <span className="genre-tag">{book.genre}</span>
              <span className="rating-display">⭐ {book.rating.toFixed(1)}</span>
            </div>

            <div className="book-stats">
              <div className="stat">
                <span className="stat-label">Pages</span>
                <span className="stat-value">{book.page_count}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Published</span>
                <span className="stat-value">{book.published_year}</span>
              </div>
              <div className="stat">
                <span className="stat-label">ISBN</span>
                <span className="stat-value">{book.isbn}</span>
              </div>
            </div>

            <div className="rating-section">
              <h3>Rate this book</h3>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    className={`rate-star ${userRating === rating ? 'active' : ''}`}
                    onClick={() => handleRateBook(rating)}
                    title={`Rate ${rating} stars`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="rating-feedback">You rated this book {userRating} stars</p>
              )}
            </div>

            <div className="action-buttons">
              <button className="btn-wishlist">❤️ Add to Wishlist</button>
              <button className="btn-share">📤 Share</button>
            </div>
          </div>
        </div>

        <div className="book-description">
          <h2>About this book</h2>
          <p>{book.description}</p>
        </div>

        {recommendedBooks.length > 0 && (
          <div className="related-books">
            <h2>You might also like</h2>
            <div className="related-books-grid">
              {recommendedBooks.map(relatedBook => (
                <div
                  key={relatedBook.id}
                  className="related-book-card"
                  onClick={() => navigate(`/book/${relatedBook.id}`)}
                >
                  <div className="related-book-cover">📖</div>
                  <h4>{relatedBook.title}</h4>
                  <p className="related-author">{relatedBook.author}</p>
                  <p className="related-genre">{relatedBook.genre}</p>
                  <p className="related-rating">⭐ {relatedBook.rating.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetails;
