const { insertQuestionResult, getQuestionResultOfLesson } = require('../models/questionResultModel');
const { isQuestionInOwnedLessonResult } = require('../models/lessonResultModel');

// Thêm kết quả một câu hỏi sau khi làm bài
const insertQuestionResultController = async (req, res) => {
    try {
        // Lấy studentId từ JWT token
        const studentId = req.user?.id;
        const {
            lessonResultId,
            questionId,
            ieltsBand,
            accuracy,
            fluency,
            completeness,
            pronunciation,
            feedback
        } = req.body;

        if (!studentId) {
            console.error('❌ No studentId found in JWT token');
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        if (!lessonResultId || !questionId) {
            console.error('❌ Missing required fields:', { lessonResultId, questionId });
            return res.status(400).json({ message: "lessonResultId and questionId are required" });
        }

        const canAttachResult = await isQuestionInOwnedLessonResult(studentId, lessonResultId, questionId);
        if (!canAttachResult) {
            return res.status(404).json({ message: "Lesson result or question not found" });
        }

        console.log('📝 Inserting question result for studentId:', studentId, 'questionId:', questionId);
        await insertQuestionResult(
            studentId,
            lessonResultId,
            questionId,
            ieltsBand || null,
            accuracy || null,
            fluency || null,
            completeness || null,
            pronunciation || null,
            feedback || null
        );
        console.log('✅ Question result inserted successfully');
        res.status(200).json({ message: "Insert question results successfully" });
    } catch (err) {
        console.error("❌ Insert question results failed: ", err);
        res.status(500).json({ message: "Insert question results failed" });
    }
};

const getQuestionResultOfLessonController = async (req, res) => {
    const studentId = req.user?.id;
    const { lessonResultId } = req.params;

    if (!studentId) {
        return res.status(401).json({ message: "Invalid authentication token" });
    }

    if (!lessonResultId) {
        return res.status(400).json({ message: "Missing lessonResultId" });
    }

    try {
        const result = await getQuestionResultOfLesson(studentId, lessonResultId);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Get question results failed: ", err);
        res.status(500).json({ message: "Get question results failed" });
    }
};

module.exports = {
    insertQuestionResultController,
    getQuestionResultOfLessonController
};
