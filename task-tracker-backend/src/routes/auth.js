// Маршрути автентифікації

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Публічні маршрути
router.post('/register', authController.register);
router.post('/login', authController.login);

// Захищені маршрути
router.get('/me', auth, authController.me);
router.put('/profile', auth, authController.updateProfile);
router.get('/users', auth, authController.getAllUsers);

module.exports = router;
