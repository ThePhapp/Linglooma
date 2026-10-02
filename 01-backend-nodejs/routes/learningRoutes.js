const express = require('express');
const learningController = require('../controllers/learningController');

const router = express.Router();

router.get('/history', learningController.getHistory);
router.get('/overview', learningController.getOverview);
router.get('/export', learningController.exportLearningData);

module.exports = router;
