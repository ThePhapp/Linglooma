const readingModel = require('../models/readingModel');

// Lấy danh sách tất cả bài đọc
const getAllPassages = async (req, res) => {
    try {
        const result = await readingModel.getAllPassages();
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('❌ Error getting passages:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error fetching reading passages',
            error: error.message
        });
    }
};

// Lấy một bài đọc kèm câu hỏi (không có đáp án)
const getPassageById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readingModel.getPassageById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Reading passage not found'
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('❌ Error getting passage:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error fetching reading passage',
            error: error.message
        });
    }
};

// Nộp bài và chấm điểm
const submitReading = async (req, res) => {
    try {
        const { id } = req.params; // passageId
        // The model validates both aliases and rejects conflicting values.
        const { answers } = req.body || {}; // [{questionId, selectedOptionId | userAnswer, timeSpent?}, ...]
        const studentId = req.user?.id; // Lấy từ JWT token

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const result = await readingModel.submitReading(studentId, id, answers);

        return res.status(200).json({
            success: true,
            message: 'Reading test submitted successfully',
            data: result
        });
    } catch (error) {
        if (error.statusCode === 400 || error.statusCode === 404) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error('❌ Error submitting reading:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error submitting reading answers',
            error: error.message
        });
    }
};

// Lấy lịch sử làm bài của học viên
const getStudentResults = async (req, res) => {
    try {
        const studentId = req.user?.id;
        const { passageId } = req.query;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const result = await readingModel.getStudentResults(studentId, passageId);

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('❌ Error getting student results:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error fetching student results',
            error: error.message
        });
    }
};

// Lấy chi tiết một kết quả
const getResultDetail = async (req, res) => {
    try {
        const { resultId } = req.params;
        const studentId = req.user?.id;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const data = await readingModel.getResultDetail(resultId, studentId);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Result not found or access denied'
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('❌ Error getting result detail:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error fetching result detail',
            error: error.message
        });
    }
};

module.exports = {
    getAllPassages,
    getPassageById,
    submitReading,
    getStudentResults,
    getResultDetail
};
