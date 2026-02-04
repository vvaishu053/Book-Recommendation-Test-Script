import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3> BookVerse</h3>
          <p>Discover your next favorite book with personalized recommendations</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Features</h4>
          <ul>
            <li><a href="#browse">Browse Books</a></li>
            <li><a href="#rate">Rate & Review</a></li>
            <li><a href="#recommend">Get Recommendations</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#facebook" className="social-link">Facebook</a>
            <a href="#twitter" className="social-link">Twitter</a>
            <a href="#instagram" className="social-link">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 BookVerse. All rights reserved. | <Link to="#">Privacy Policy</Link> | <Link to="#">Terms of Service</Link></p>
      </div>
    </footer>
  );
}

export default Footer;
