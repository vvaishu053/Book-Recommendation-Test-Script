const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/', authMiddleware, recommendationController.getRecommendations);
router.post('/rate', authMiddleware, recommendationController.rateBook);
router.get('/user-ratings', authMiddleware, recommendationController.getUserRatings);

module.exports = router;
