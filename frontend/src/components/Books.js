import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Books.css';

function Books({ user, setUser }) {
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBooks();
    fetchRecommendations();
  }, [user, navigate]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/books`);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
    setLoading(false);
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
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
      fetchRecommendations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to rate book');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="books-container">
      <div className="books-tabs">
        <button
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
           Recommendations
        </button>
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
           All Books
        </button>
      </div>

      <main className="books-main">
        {loading ? (
          <div className="loading">Loading books...</div>
        ) : activeTab === 'recommendations' ? (
          <section className="books-section">
            {recommendations.length > 0 ? (
              <>
                <h2>Recommended for You</h2>
                <div className="books-grid">
                  {recommendations.map((book) => (
                    <div key={book.id} className="book-card">
                      <div className="book-header" onClick={() => navigate(`/book/${book.id}`)}>
                        <h3>{book.title}</h3>
                      </div>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-genre">{book.genre}</p>
                      <p className="book-description">{book.description}</p>
                      <p className="book-rating">⭐ {book.rating.toFixed(1)}</p>
                      <button className="btn-view-details" onClick={() => navigate(`/book/${book.id}`)}>
                        View Details →
                      </button>
                      <div className="rating-buttons">
                        {[1, 2, 3, 4, 5].map((rating) => (
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
              </>
            ) : (
              <div className="no-data">
                <p>No recommendations yet. Start rating books to get personalized recommendations!</p>
              </div>
            )}
          </section>
        ) : (
          <section className="books-section">
            <h2>All Books</h2>
            <div className="books-grid">
              {books.map((book) => (
                <div key={book.id} className="book-card">
                  <div className="book-header" onClick={() => navigate(`/book/${book.id}`)}>
                    <h3>{book.title}</h3>
                  </div>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-genre">{book.genre}</p>
                  <p className="book-description">{book.description}</p>
                  <p className="book-rating">⭐ {book.rating.toFixed(1)}</p>
                  <button className="btn-view-details" onClick={() => navigate(`/book/${book.id}`)}>
                    View Details →
                  </button>
                  <div className="rating-buttons">
                    {[1, 2, 3, 4, 5].map((rating) => (
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
          </section>
        )}
      </main>
    </div>
  );
}

export default Books;
