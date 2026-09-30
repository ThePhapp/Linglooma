const writingModel = require('../models/writingModel');

/**
 * Lấy danh sách tất cả đề Writing
 */
async function getAllPrompts(req, res) {
  try {
    const prompts = await writingModel.getAllPrompts();
    res.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('Failed to get writing prompts');
    res.status(500).json({
      success: false,
      message: 'Failed to get writing prompts',
      error: error.message
    });
  }
}

/**
 * Lấy chi tiết một đề Writing
 */
async function getPromptById(req, res) {
  try {
    const { id } = req.params;
    if (!isPositiveId(id)) return res.status(400).json({ success: false, message: 'Invalid prompt ID' });
    const prompt = await writingModel.getPromptById(id);
    
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }
    
    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('Failed to get writing prompt');
    res.status(500).json({
      success: false,
      message: 'Failed to get writing prompt',
      error: error.message
    });
  }
}

/**
 * Nộp bài Writing (yêu cầu đăng nhập)
 */
async function submitWriting(req, res) {
  try {
    const { id } = req.params;
    const { essayText } = req.body || {};
    const studentId = req.user.id; // Từ JWT middleware
    
    if (!isPositiveId(id)) return res.status(400).json({ success: false, message: 'Invalid prompt ID' });
    if (typeof essayText !== 'string' || essayText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Essay text is required'
      });
    }
    if (essayText.length > 12000) return res.status(413).json({ success: false, message: 'Essay too long' });
    
    
    const result = await writingModel.submitWriting({
      promptId: id,
      studentId,
      essayText
    });
    
    res.json({
      success: true,
      message: 'Essay submitted and evaluated successfully',
      data: result
    });
  } catch (error) {
    if (error.code === 'WRITING_EVALUATION_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        code: 'WRITING_EVALUATION_UNAVAILABLE',
        message: 'Essay saved, but evaluation is temporarily unavailable. Please try again.',
        retryable: true,
        submissionId: error.submissionId
      });
    }
    console.error('Failed to submit writing');
    res.status(500).json({
      success: false,
      message: 'Failed to submit essay'
    });
  }
}

/**
 * Lấy lịch sử làm bài Writing của học sinh
 */
async function getStudentSubmissions(req, res) {
  try {
    const studentId = req.user.id;
    const submissions = await writingModel.getStudentSubmissions(studentId);
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Failed to get student writing submissions');
    res.status(500).json({
      success: false,
      message: 'Failed to get submission history',
      error: error.message
    });
  }
}

/**
 * Lấy chi tiết kết quả một bài làm
 */
async function getSubmissionDetail(req, res) {
  try {
    const { submissionId } = req.params;
    if (!isPositiveId(submissionId)) return res.status(400).json({ success: false, message: 'Invalid submission ID' });
    const studentId = req.user.id;
    
    const detail = await writingModel.getSubmissionDetail(submissionId, studentId);
    
    if (!detail) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }
    
    res.json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Failed to get writing submission detail');
    res.status(500).json({
      success: false,
      message: 'Failed to get submission detail',
      error: error.message
    });
  }
}

function isPositiveId(value) {
  return /^(?:[1-9]\d*)$/.test(String(value)) && Number.isSafeInteger(Number(value));
}

module.exports = {
  getAllPrompts,
  getPromptById,
  submitWriting,
  getStudentSubmissions,
  getSubmissionDetail
};
