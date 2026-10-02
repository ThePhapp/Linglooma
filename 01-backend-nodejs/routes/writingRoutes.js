const express = require('express');
const router = express.Router();
const writingController = require('../controllers/writingController');
const jwtauth = require('../middleware/jwtauth');

/**
 * Routes for Writing feature
 * Public routes: GET list and GET detail
 * Protected routes: GET history, GET submission detail, POST submit
 */

// Public routes - Không cần login
// GET /api/writing - Lấy danh sách tất cả đề Writing
router.get('/', writingController.getAllPrompts);

// GET /api/writing/:id - Lấy chi tiết một đề Writing
router.get('/:id', writingController.getPromptById);

// Protected routes - Cần login
// GET /api/writing/submissions/history - Lịch sử làm bài
router.get('/submissions/history', jwtauth, writingController.getStudentSubmissions);

// GET /api/writing/submissions/:submissionId - Chi tiết kết quả
router.get('/submissions/:submissionId', jwtauth, writingController.getSubmissionDetail);

// POST /api/writing/submissions/:submissionId/retry-evaluation - Retry AI without duplicating the essay
router.post('/submissions/:submissionId/retry-evaluation', jwtauth, writingController.retryWritingEvaluation);

// POST /api/writing/:id/submit - Nộp bài Writing
router.post('/:id/submit', jwtauth, writingController.submitWriting);

module.exports = router;
