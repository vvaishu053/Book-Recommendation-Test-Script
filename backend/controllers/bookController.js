const { dbGet, dbAll } = require('../config/db');

const bookController = {
  // Get all books
  getAllBooks: async (req, res) => {
    try {
      const books = await dbAll('SELECT * FROM books');
      res.status(200).json({ books });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch books', error: error.message });
    }
  },

  // Get book by ID
  getBookById: async (req, res) => {
    try {
      const { id } = req.params;
      const book = await dbGet('SELECT * FROM books WHERE id = ?', [id]);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      res.status(200).json({ book });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch book', error: error.message });
    }
  },

  // Search books
  searchBooks: async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const books = await dbAll(
        'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?',
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );

      res.status(200).json({ books });
    } catch (error) {
      res.status(500).json({ message: 'Search failed', error: error.message });
    }
  },

  // Get books by genre
  getBooksByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const books = await dbAll('SELECT * FROM books WHERE genre = ?', [genre]);

      res.status(200).json({ books });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch books by genre', error: error.message });
    }
  },

  // Get top-rated books
  getTopRatedBooks: async (req, res) => {
    try {
      const books = await dbAll('SELECT * FROM books ORDER BY rating DESC LIMIT 10');
      res.status(200).json({ books });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch top-rated books', error: error.message });
    }
  },
};

module.exports = bookController;
