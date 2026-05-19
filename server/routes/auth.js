const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authClient = require('../middleware/authClient');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authClient, authController.me);
router.put('/profile', authClient, authController.updateProfile);

module.exports = router;
