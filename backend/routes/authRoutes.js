const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication middleware)
const authMiddleware = require('../middleware/authMiddleware');
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
