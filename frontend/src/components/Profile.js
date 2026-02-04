import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function Profile({ user }) {
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserRatings();
  }, [user, navigate]);

  const fetchUserRatings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/recommendations/user-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRatings(response.data.ratings);
    } catch (error) {
      console.error('Failed to fetch user ratings:', error);
    }
    setLoading(false);
  };

  const averageRating = userRatings.length > 0
    ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
    : 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-stats">
          <div className="stat">
            <h3>{userRatings.length}</h3>
            <p>Books Rated</p>
          </div>
          <div className="stat">
            <h3>{averageRating}</h3>
            <p>Average Rating</p>
          </div>
          <div className="stat">
            <h3>{userRatings.filter(r => r.rating >= 4).length}</h3>
            <p>Favorites</p>
          </div>
        </div>

        <div className="ratings-section">
          <h2>Your Book Ratings</h2>
          {loading ? (
            <p className="loading">Loading your ratings...</p>
          ) : userRatings.length > 0 ? (
            <div className="ratings-list">
              {userRatings.map((rating) => (
                <div key={rating.id} className="rating-item">
                  <div className="rating-content">
                    <h3>{rating.title}</h3>
                    <p className="author">by {rating.author}</p>
                    <p className="genre">{rating.genre}</p>
                  </div>
                  <div className="rating-value">
                    <span className="stars">{'⭐'.repeat(rating.rating)}</span>
                    <span className="rating-number">{rating.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-ratings">You haven't rated any books yet. Start exploring!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
