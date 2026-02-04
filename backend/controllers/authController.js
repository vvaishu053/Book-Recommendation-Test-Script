const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbRun, dbGet, dbAll } = require('../config/db');

const authController = {
  // User Registration
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Please provide email, password, and name' });
      }

      // Check if user exists
      const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      await dbRun('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
        name,
        email,
        hashedPassword,
      ]);

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  // User Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Find user
      const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      res.status(200).json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await dbGet('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
  },
};

module.exports = authController;
