const express = require('express');
const router = express.Router();
const enquiriesController = require('../controllers/enquiriesController');
const authClient = require('../middleware/authClient');

router.get('/me', authClient, enquiriesController.listMine);
router.post('/guest', enquiriesController.guestSubmit); // no auth — creates account + enquiry together
router.post('/', authClient, enquiriesController.create);
router.get('/:id', authClient, enquiriesController.getOne);
router.put('/:id', authClient, enquiriesController.update);

module.exports = router;
