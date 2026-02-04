import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ user }) {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="home-title">Book Recommendation System</h1>
          <p className="home-subtitle">Discover Your Next Favorite Book</p>
          <p className="home-description">
            Explore thousands of books and get personalized recommendations based on your reading preferences. Join our community of book lovers today.
          </p>
          {!user && (
            <div className="home-buttons">
              <button className="btn-primary-large" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn-secondary-large" onClick={() => navigate('/register')}>
                Create Account
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose BookVerse?</h2>
        <div className="home-features">
          <div className="feature">
            <div className="feature-icon">🔍</div>
            <h3>Discover</h3>
            <p>Browse thousands of books across all genres and find your next favorite read</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⭐</div>
            <h3>Rate & Review</h3>
            <p>Share your thoughts and help other readers find books they'll love</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💡</div>
            <h3>Smart Recommendations</h3>
            <p>Get personalized suggestions based on your reading history and preferences</p>
          </div>
          <div className="feature">
            <div className="feature-icon">👥</div>
            <h3>Community</h3>
            <p>Connect with fellow book enthusiasts and share your reading journey</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {user && (
        <section className="stats-section">
          <div className="stat">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Books Available</div>
          </div>
          <div className="stat">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Active Readers</div>
          </div>
          <div className="stat">
            <div className="stat-number">100K+</div>
            <div className="stat-label">Recommendations</div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
