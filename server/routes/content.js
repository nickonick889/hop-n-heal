// Public content routes — no auth required
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/services', contentController.listServices);
router.get('/services/:slug', contentController.getService);
router.get('/stay', contentController.listStay);
router.get('/transport', contentController.listTransport);
router.get('/activities', contentController.listActivities);
router.get('/partners', contentController.listPartners);

module.exports = router;
