const recommendationController = require('../controllers/recommendationController');
const { dbRun, dbGet, dbAll } = require('../config/db');

jest.mock('../config/db');

describe('recommendationController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    test('should get recommendations successfully', async () => {
      const userRatings = [
        { genre: 'Fiction', avg_rating: 4.5 },
        { genre: 'Mystery', avg_rating: 4.0 }
      ];
      const recommendations = [
        { id: 1, title: 'Fiction Book', genre: 'Fiction', rating: 4.8 }
      ];

      dbAll
        .mockResolvedValueOnce(userRatings)
        .mockResolvedValueOnce(recommendations);

      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recommendations });
    });

    test('should return empty recommendations if user has no ratings', async () => {
      dbAll.mockResolvedValueOnce([]);

      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        recommendations: [],
        message: 'No recommendations available yet'
      });
    });

    test('should handle database errors', async () => {
      dbAll.mockRejectedValueOnce(new Error('Database error'));

      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('rateBook', () => {
    test('should rate book successfully', async () => {
      req.body = { bookId: 1, rating: 5 };
      const book = { id: 1, title: 'Test Book' };
      dbGet.mockResolvedValueOnce(book);
      dbGet.mockResolvedValueOnce(null);
      dbRun.mockResolvedValueOnce({});

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book rated successfully' });
    });

    test('should update existing rating', async () => {
      req.body = { bookId: 1, rating: 4 };
      const book = { id: 1, title: 'Test Book' };
      const existingRating = { id: 1, user_id: 1, book_id: 1, rating: 3 };
      
      dbGet.mockResolvedValueOnce(book);
      dbGet.mockResolvedValueOnce(existingRating);
      dbRun.mockResolvedValueOnce({});

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 if rating is invalid', async () => {
      req.body = { bookId: 1, rating: 6 };

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid book ID or rating (must be 1-5)'
      });
    });

    test('should return 400 if bookId is missing', async () => {
      req.body = { rating: 5 };

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid book ID or rating (must be 1-5)'
      });
    });

    test('should return 404 if book not found', async () => {
      req.body = { bookId: 999, rating: 5 };
      dbGet.mockResolvedValueOnce(null);

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
    });

    test('should handle database errors', async () => {
      req.body = { bookId: 1, rating: 5 };
      dbGet.mockRejectedValueOnce(new Error('Database error'));

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserRatings', () => {
    test('should get user ratings successfully', async () => {
      const ratings = [
        { id: 1, title: 'Book 1', rating: 5 },
        { id: 2, title: 'Book 2', rating: 4 }
      ];
      dbAll.mockResolvedValueOnce(ratings);

      await recommendationController.getUserRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ratings });
    });

    test('should return empty array if user has no ratings', async () => {
      dbAll.mockResolvedValueOnce([]);

      await recommendationController.getUserRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ratings: [] });
    });

    test('should handle database errors', async () => {
      dbAll.mockRejectedValueOnce(new Error('Database error'));

      await recommendationController.getUserRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
