const bookController = require('../controllers/bookController');
const { dbGet, dbAll } = require('../config/db');

jest.mock('../config/db');

describe('bookController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    test('should get all books successfully', async () => {
      const books = [
        { id: 1, title: 'Book 1', author: 'Author 1' },
        { id: 2, title: 'Book 2', author: 'Author 2' }
      ];
      dbAll.mockResolvedValueOnce(books);

      await bookController.getAllBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books });
    });

    test('should handle database errors', async () => {
      dbAll.mockRejectedValueOnce(new Error('Database error'));

      await bookController.getAllBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getBookById', () => {
    test('should get book by ID successfully', async () => {
      req.params = { id: 1 };
      const book = { id: 1, title: 'Book 1', author: 'Author 1', genre: 'Fiction' };
      dbGet.mockResolvedValueOnce(book);

      await bookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ book });
    });

    test('should return 404 if book not found', async () => {
      req.params = { id: 999 };
      dbGet.mockResolvedValueOnce(null);

      await bookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
    });

    test('should handle database errors', async () => {
      req.params = { id: 1 };
      dbGet.mockRejectedValueOnce(new Error('Database error'));

      await bookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('searchBooks', () => {
    test('should search books successfully', async () => {
      req.query = { query: 'fiction' };
      const books = [{ id: 1, title: 'Fiction Book', author: 'Author 1' }];
      dbAll.mockResolvedValueOnce(books);

      await bookController.searchBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books });
    });

    test('should return 400 if search query is missing', async () => {
      req.query = {};

      await bookController.searchBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required' });
    });

    test('should handle database errors', async () => {
      req.query = { query: 'test' };
      dbAll.mockRejectedValueOnce(new Error('Database error'));

      await bookController.searchBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getBooksByGenre', () => {
    test('should get books by genre successfully', async () => {
      req.params = { genre: 'Fiction' };
      const books = [{ id: 1, title: 'Fiction Book', genre: 'Fiction' }];
      dbAll.mockResolvedValueOnce(books);

      await bookController.getBooksByGenre(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books });
    });

    test('should return empty array if no books found', async () => {
      req.params = { genre: 'Unknown' };
      dbAll.mockResolvedValueOnce([]);

      await bookController.getBooksByGenre(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books: [] });
    });

    test('should handle database errors', async () => {
      req.params = { genre: 'Fiction' };
      dbAll.mockRejectedValueOnce(new Error('Database error'));

      await bookController.getBooksByGenre(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTopRatedBooks', () => {
    test('should get top-rated books successfully', async () => {
      const books = [
        { id: 1, title: 'Best Book', rating: 5.0 },
        { id: 2, title: 'Good Book', rating: 4.5 }
      ];
      dbAll.mockResolvedValueOnce(books);

      await bookController.getTopRatedBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ books });
    });

    test('should handle database errors', async () => {
      dbAll.mockRejectedValueOnce(new Error('Database error'));

      await bookController.getTopRatedBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
