const { findQuestionBasedOnLesson } = require("../models/questionModel");


const getQuestionsByLesson = async (req, res) => {
    const { lessonId } = req.params;
    try {
        if (!lessonId) {
            return res.status(400).json({ message: "Missing lessonId" });
        }
        const result = await findQuestionBasedOnLesson(lessonId);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No questions found for this lesson" });
        }

        return res.json({ questions: result.rows });
    } catch (err) {
        console.error("Failed to fetch questions");
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getQuestionsByLesson,
};

