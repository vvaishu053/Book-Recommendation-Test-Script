import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About BookVerse</h1>
        <p>Your gateway to discovering extraordinary books</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2> Our Mission</h2>
          <p>
            At BookVerse, we believe that reading transforms lives. Our mission is to connect readers with books they'll love through intelligent recommendations tailored to their preferences. We're dedicated to making book discovery easy, enjoyable, and personalized for every reader.
          </p>
        </section>

        <section className="about-section">
          <h2> Why Choose BookVerse?</h2>
          <div className="features-grid">
            <div className="feature-box">
              <h3> Smart Recommendations</h3>
              <p>Our algorithm analyzes your reading preferences to suggest books you'll absolutely love.</p>
            </div>
            <div className="feature-box">
              <h3> Vast Collection</h3>
              <p>Browse over 115 carefully curated books across multiple genres and categories.</p>
            </div>
            <div className="feature-box">
              <h3> Community Reviews</h3>
              <p>Read ratings and reviews from other book lovers to make informed decisions.</p>
            </div>
            <div className="feature-box">
              <h3>Beautiful Design</h3>
              <p>A clean, intuitive interface designed for a seamless reading discovery experience.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2> Our Features</h2>
          <ul className="features-list">
            <li> Personalized Book Recommendations</li>
            <li> Advanced Search and Filtering</li>
            <li> Rate and Review Books</li>
            <li> Wishlist Management</li>
            <li> Track Your Reading Journey</li>
            <li> Browse by Genre</li>
          </ul>
        </section>

        <section className="about-section">
          <h2> By The Numbers</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <h3>115+</h3>
              <p>Books in Database</p>
            </div>
            <div className="stat-box">
              <h3>12+</h3>
              <p>Genres Covered</p>
            </div>
            <div className="stat-box">
              <h3>∞</h3>
              <p>Reading Possibilities</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2> How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free BookVerse account in seconds.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse & Rate</h3>
              <p>Explore our collection and rate books you've read.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized suggestions based on your ratings.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Discover More</h3>
              <p>Keep exploring and building your perfect reading list.</p>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Ready to Start Your Reading Journey?</h2>
          <p>Join thousands of book lovers who are discovering their next favorite book.</p>
          <Link to="/register" className="btn-primary-large">Get Started Today</Link>
        </section>
      </div>
    </div>
  );
}

export default About;
