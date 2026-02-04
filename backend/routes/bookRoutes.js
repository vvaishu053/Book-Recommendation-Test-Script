const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/top-rated', bookController.getTopRatedBooks);
router.get('/search', bookController.searchBooks);
router.get('/genre/:genre', bookController.getBooksByGenre);
router.get('/:id', bookController.getBookById);

module.exports = router;
