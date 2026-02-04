import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
           BookVerse
        </Link>

        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>

          {user && (
            <>
              <li className="nav-item">
                <Link to="/books" className={`nav-link ${isActive('/books')}`} onClick={() => setIsMenuOpen(false)}>
                  Books
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/search" className={`nav-link ${isActive('/search')}`} onClick={() => setIsMenuOpen(false)}>
                  Search
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
              </li>
            </>
          )}

          <li className="nav-item">
            <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </li>

          {user ? (
            <li className="nav-item">
              <button className="nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className={`nav-link nav-register ${isActive('/register')}`} onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
