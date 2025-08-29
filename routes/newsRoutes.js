const express = require('express');
const { getNewsForUser, getNewsByCategory } = require('../controllers/newsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.get('/', authenticateToken, getNewsForUser);

module.exports = router; 