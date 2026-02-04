const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('should authenticate user with valid token', () => {
    req.headers.authorization = 'Bearer validToken123';
    const decoded = { id: 1, email: 'test@example.com', name: 'Test User' };
    jwt.verify.mockReturnValueOnce(decoded);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken123', 'your_secret_key');
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 if no token provided', () => {
    req.headers.authorization = '';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if authorization header is missing', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidToken';
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is expired', () => {
    req.headers.authorization = 'Bearer expiredToken';
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Token expired');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should handle Bearer token extraction correctly', () => {
    req.headers.authorization = 'Bearer myTokenValue';
    const decoded = { id: 2, email: 'user@example.com' };
    jwt.verify.mockReturnValueOnce(decoded);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('myTokenValue', 'your_secret_key');
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});
