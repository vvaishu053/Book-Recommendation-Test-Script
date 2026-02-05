import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Books from './components/Books';
import About from './components/About';
import Contact from './components/Contact';
import Profile from './components/Profile';
import Search from './components/Search';
import BookDetails from './components/BookDetails';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const verifyToken = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      };
      verifyToken();
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <Router>
      {user && <Navbar user={user} setUser={setUser} />}

      <Routes>
       
        <Route path="/" element={<Home user={user} />} />

        <Route path="/login" element={<Login user={user} setUser={setUser} />} />
        <Route path="/register" element={<Register user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/books"
          element={user ? <Books user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/search"
          element={user ? <Search user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/book/:id"
          element={user ? <BookDetails user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
      </Routes>

      {user && <Footer />}
    </Router>
  );
}

export default App;
