const authController = require('../controllers/authController');
const { dbRun, dbGet } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      dbGet.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      dbRun.mockResolvedValueOnce({});

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    test('should return 400 if missing required fields', async () => {
      req.body = { email: 'test@example.com' };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please provide email, password, and name' });
    });

    test('should return 409 if user already exists', async () => {
      req.body = { email: 'existing@example.com', password: 'password123', name: 'Test' };
      dbGet.mockResolvedValueOnce({ id: 1, email: 'existing@example.com' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    test('should handle database errors', async () => {
      req.body = { email: 'test@example.com', password: 'password123', name: 'Test' };
      dbGet.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      dbRun.mockRejectedValueOnce(new Error('Database error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    test('should login user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const user = { id: 1, email: 'test@example.com', name: 'Test User', password: 'hashedPassword' };
      dbGet.mockResolvedValueOnce(user);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mockToken');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'mockToken',
        user: { id: 1, name: 'Test User', email: 'test@example.com' }
      });
    });

    test('should return 400 if missing email or password', async () => {
      req.body = { email: 'test@example.com' };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please provide email and password' });
    });

    test('should return 401 if user not found', async () => {
      req.body = { email: 'notfound@example.com', password: 'password123' };
      dbGet.mockResolvedValueOnce(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    test('should return 401 if password is invalid', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const user = { id: 1, email: 'test@example.com', name: 'Test User', password: 'hashedPassword' };
      dbGet.mockResolvedValueOnce(user);
      bcrypt.compare.mockResolvedValueOnce(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    test('should handle login errors', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      dbGet.mockRejectedValueOnce(new Error('Database error'));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getProfile', () => {
    test('should get user profile successfully', async () => {
      req.user = { id: 1 };
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      dbGet.mockResolvedValueOnce(user);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user });
    });

    test('should return 404 if user not found', async () => {
      req.user = { id: 999 };
      dbGet.mockResolvedValueOnce(null);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should handle database errors', async () => {
      req.user = { id: 1 };
      dbGet.mockRejectedValueOnce(new Error('Database error'));

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
