const express = require('express');
const controller = require('../controllers/learningIntelligenceController');

const router = express.Router();
router.get('/profile', controller.getProfile);
router.put('/profile', controller.saveProfile);
router.get('/study-plan', controller.getPlan);
router.patch('/study-plan/:id', controller.updatePlanItem);
router.post('/study-plan/:id/replace', controller.replacePlanItem);
router.get('/mistakes', controller.getMistakes);
router.patch('/mistakes/:id/review', controller.reviewMistake);
router.get('/vocabulary', controller.getVocabulary);
router.post('/vocabulary', controller.saveVocabulary);
router.patch('/vocabulary/:id/review', controller.reviewVocabulary);

module.exports = router;
