const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');
const recommendationController = require('../controllers/recommendationController');

// Mock database
jest.mock('../config/db');
const { dbRun, dbGet, dbAll } = require('../config/db');

// Mock bcryptjs
jest.mock('bcryptjs');
const bcrypt = require('bcryptjs');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

describe('Integration Tests - Authentication Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('User Registration & Login Flow', () => {
    test('should complete full registration flow', async () => {
      req.body = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      dbGet.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPassword123');
      dbRun.mockResolvedValueOnce({});

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    test('should prevent duplicate user registration', async () => {
      req.body = { name: 'Jane Doe', email: 'existing@example.com', password: 'password123' };
      dbGet.mockResolvedValueOnce({ id: 1, email: 'existing@example.com' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    test('should complete login flow successfully', async () => {
      req.body = { email: 'john@example.com', password: 'password123' };
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashedPassword123'
      };

      dbGet.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        user: { id: 1, name: 'John Doe', email: 'john@example.com' }
      });
    });

    test('should reject login with wrong password', async () => {
      req.body = { email: 'john@example.com', password: 'wrongpassword' };
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashedPassword123'
      };

      dbGet.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    test('should get user profile after authentication', async () => {
      req.user = { id: 1 };
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      dbGet.mockResolvedValueOnce(mockUser);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });
  });
});

describe('Integration Tests - Books API', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Book Retrieval Flow', () => {
    test('should fetch all books with details', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', rating: 4.5 },
        { id: 2, title: 'Book 2', author: 'Author 2', genre: 'Mystery', rating: 4.0 }
      ];

      dbAll.mockResolvedValueOnce(mockBooks);

      await bookController.getAllBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: mockBooks });
    });

    test('should fetch single book by ID', async () => {
      req.params = { id: 1 };
      const mockBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        description: 'Classic novel',
        rating: 4.7
      };

      dbGet.mockResolvedValueOnce(mockBook);

      await bookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ book: mockBook });
    });

    test('should handle non-existent book', async () => {
      req.params = { id: 999 };
      dbGet.mockResolvedValueOnce(null);

      await bookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
    });

    test('should search books by query', async () => {
      req.query = { query: 'fiction' };
      const mockBooks = [
        { id: 1, title: 'Fiction Novel', author: 'Author A', genre: 'Fiction', rating: 4.5 }
      ];

      dbAll.mockResolvedValueOnce(mockBooks);

      await bookController.searchBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: mockBooks });
    });

    test('should reject search without query', async () => {
      req.query = {};

      await bookController.searchBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required' });
    });

    test('should filter books by genre', async () => {
      req.params = { genre: 'Fiction' };
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction', rating: 4.5 }
      ];

      dbAll.mockResolvedValueOnce(mockBooks);

      await bookController.getBooksByGenre(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: mockBooks });
    });

    test('should get top-rated books', async () => {
      const mockBooks = [
        { id: 1, title: 'Best Book', author: 'Author A', genre: 'Fiction', rating: 5.0 },
        { id: 2, title: 'Good Book', author: 'Author B', genre: 'Mystery', rating: 4.8 }
      ];

      dbAll.mockResolvedValueOnce(mockBooks);

      await bookController.getTopRatedBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: mockBooks });
    });
  });
});

describe('Integration Tests - Recommendations & Ratings', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 1 },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Rating System Flow', () => {
    test('should rate a book successfully (new rating)', async () => {
      req.body = { bookId: 1, rating: 5 };
      const mockBook = { id: 1, title: 'Test Book', author: 'Test Author' };

      dbGet.mockResolvedValueOnce(mockBook);
      dbGet.mockResolvedValueOnce(null);
      dbRun.mockResolvedValueOnce({});

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book rated successfully' });
    });

    test('should update existing book rating', async () => {
      req.body = { bookId: 1, rating: 4 };
      const mockBook = { id: 1, title: 'Test Book' };
      const existingRating = { id: 1, user_id: 1, book_id: 1, rating: 3 };

      dbGet.mockResolvedValueOnce(mockBook);
      dbGet.mockResolvedValueOnce(existingRating);
      dbRun.mockResolvedValueOnce({});

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book rated successfully' });
    });

    test('should reject invalid rating value', async () => {
      req.body = { bookId: 1, rating: 10 };

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid book ID or rating (must be 1-5)'
      });
    });

    test('should reject rating for non-existent book', async () => {
      req.body = { bookId: 999, rating: 5 };
      dbGet.mockResolvedValueOnce(null);

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
    });
  });

  describe('Recommendation System Flow', () => {
    test('should get personalized recommendations based on ratings', async () => {
      const mockRatings = [
        { genre: 'Fiction', avg_rating: 4.5 },
        { genre: 'Mystery', avg_rating: 4.0 }
      ];
      const mockRecommendations = [
        { id: 3, title: 'Fiction Book', author: 'Author C', genre: 'Fiction', rating: 4.8 }
      ];

      dbAll.mockResolvedValueOnce(mockRatings);
      dbAll.mockResolvedValueOnce(mockRecommendations);

      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recommendations: mockRecommendations });
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

    test('should get user rating history', async () => {
      const mockUserRatings = [
        { id: 1, title: 'Book 1', author: 'Author 1', rating: 5 },
        { id: 2, title: 'Book 2', author: 'Author 2', rating: 4 }
      ];

      dbAll.mockResolvedValueOnce(mockUserRatings);

      await recommendationController.getUserRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ratings: mockUserRatings });
    });

    test('should handle user with no ratings in history', async () => {
      dbAll.mockResolvedValueOnce([]);

      await recommendationController.getUserRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ratings: [] });
    });
  });
});

describe('Integration Tests - Complex User Workflows', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Complete User Journey', () => {
    test('should complete registration -> login -> browse -> rate -> get recommendations', async () => {
      // Step 1: Register
      req.body = { name: 'User', email: 'user@example.com', password: 'pass123' };
      dbGet.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPass');
      dbRun.mockResolvedValueOnce({});

      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      // Step 2: Login
      req.body = { email: 'user@example.com', password: 'pass123' };
      const mockUser = { id: 1, email: 'user@example.com', name: 'User', password: 'hashedPass' };
      dbGet.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('token123');

      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);

      jest.clearAllMocks();

      // Step 3: Browse books
      req.params = {};
      req.query = {};
      const mockBooks = [{ id: 1, title: 'Book 1', rating: 4.5 }];
      dbAll.mockResolvedValueOnce(mockBooks);

      await bookController.getAllBooks(req, res);
      expect(res.status).toHaveBeenCalledWith(200);

      jest.clearAllMocks();

      // Step 4: Rate a book
      req.body = { bookId: 1, rating: 5 };
      req.user = { id: 1 };
      dbGet.mockResolvedValueOnce({ id: 1, title: 'Book 1' });
      dbGet.mockResolvedValueOnce(null);
      dbRun.mockResolvedValueOnce({});

      await recommendationController.rateBook(req, res);
      expect(res.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      // Step 5: Get recommendations
      req.body = {};
      dbAll.mockResolvedValueOnce([{ genre: 'Fiction', avg_rating: 4.5 }]);
      dbAll.mockResolvedValueOnce([{ id: 2, title: 'Book 2', genre: 'Fiction', rating: 4.8 }]);

      await recommendationController.getRecommendations(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should handle error scenarios in workflow', async () => {
      // Try to rate non-existent book
      req.body = { bookId: 999, rating: 5 };
      req.user = { id: 1 };
      dbGet.mockResolvedValueOnce(null);

      await recommendationController.rateBook(req, res);
      expect(res.status).toHaveBeenCalledWith(404);

      jest.clearAllMocks();

      // Try to search without query
      req.query = {};
      await bookController.searchBooks(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('Integration Tests - Error Handling', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Database Error Handling', () => {
    test('should handle database errors in book retrieval', async () => {
      dbAll.mockRejectedValueOnce(new Error('Database connection failed'));

      await bookController.getAllBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch books',
        error: 'Database connection failed'
      });
    });

    test('should handle database errors in registration', async () => {
      req.body = { name: 'User', email: 'user@example.com', password: 'pass123' };
      dbGet.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPass');
      dbRun.mockRejectedValueOnce(new Error('DB error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Registration failed',
        error: 'DB error'
      });
    });

    test('should handle database errors in rating', async () => {
      req.body = { bookId: 1, rating: 5 };
      req.user = { id: 1 };
      dbGet.mockRejectedValueOnce(new Error('DB error'));

      await recommendationController.rateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to rate book',
        error: 'DB error'
      });
    });
  });
});
