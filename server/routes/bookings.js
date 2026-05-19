const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const authClient = require('../middleware/authClient');

router.get('/me', authClient, bookingsController.listMine);
router.get('/:id', authClient, bookingsController.getOne);

module.exports = router;
