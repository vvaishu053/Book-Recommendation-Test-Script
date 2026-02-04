const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const { db, dbRun } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Read the SQL schema file
    const sqlFile = path.join(__dirname, '../database/bookstore.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL statements and execute them
    const statements = sql
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);
    
    for (const statement of statements) {
      await dbRun(statement);
    }
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server and initialize database (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await initializeDatabase();
  });
  module.exports = server;
} else {
  module.exports = app;
}
