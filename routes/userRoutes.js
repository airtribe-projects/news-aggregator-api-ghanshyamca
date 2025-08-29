const express = require('express');
const { registerUser, loginUser, getProfile, getUserPreferences, updateUserPreferences } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateUserRegistration, validateUserLogin, validateUserPreferences } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

// Protected routes
router.get('/preferences', authenticateToken, getUserPreferences);
router.put('/preferences', authenticateToken, validateUserPreferences, updateUserPreferences);

module.exports = router; 