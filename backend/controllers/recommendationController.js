const { dbRun, dbGet, dbAll } = require('../config/db');

const recommendationController = {
  // Get personalized recommendations for user
  getRecommendations: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get user's preferred genres from ratings
      const userRatings = await dbAll(
        `SELECT b.genre, AVG(r.rating) as avg_rating
         FROM ratings r
         JOIN books b ON r.book_id = b.id
         WHERE r.user_id = ?
         GROUP BY b.genre
         ORDER BY avg_rating DESC
         LIMIT 3`,
        [userId]
      );

      if (!userRatings || userRatings.length === 0) {
        return res.status(200).json({ recommendations: [], message: 'No recommendations available yet' });
      }

      // Get top-rated books from preferred genres
      const genres = userRatings.map((r) => r.genre);
      const placeholders = genres.map(() => '?').join(',');

      const recommendations = await dbAll(
        `SELECT * FROM books 
         WHERE genre IN (${placeholders}) 
         AND id NOT IN (SELECT book_id FROM ratings WHERE user_id = ?)
         ORDER BY rating DESC
         LIMIT 10`,
        [...genres, userId]
      );

      res.status(200).json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
    }
  },

  // Rate a book
  rateBook: async (req, res) => {
    try {
      const userId = req.user.id;
      const { bookId, rating } = req.body;

      if (!bookId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid book ID or rating (must be 1-5)' });
      }

      // Check if book exists
      const book = await dbGet('SELECT * FROM books WHERE id = ?', [bookId]);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Check if rating already exists
      const existingRating = await dbGet('SELECT * FROM ratings WHERE user_id = ? AND book_id = ?', [
        userId,
        bookId,
      ]);

      if (existingRating) {
        // Update existing rating
        await dbRun('UPDATE ratings SET rating = ? WHERE user_id = ? AND book_id = ?', [rating, userId, bookId]);
      } else {
        // Insert new rating
        await dbRun('INSERT INTO ratings (user_id, book_id, rating) VALUES (?, ?, ?)', [userId, bookId, rating]);
      }

      res.status(201).json({ message: 'Book rated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to rate book', error: error.message });
    }
  },

  // Get user's ratings
  getUserRatings: async (req, res) => {
    try {
      const userId = req.user.id;

      const ratings = await dbAll(
        `SELECT b.*, r.rating 
         FROM ratings r
         JOIN books b ON r.book_id = b.id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );

      res.status(200).json({ ratings });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user ratings', error: error.message });
    }
  },
};

module.exports = recommendationController;
