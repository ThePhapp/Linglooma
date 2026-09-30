const {
  insertOrUpdateIncorrectPhonemes,
  getIncorrectPhonemesOfLesson,
  getTopIncorrectPhonemesWithAvgScore,
  getResultViews,
} = require("../models/incorrectphonemesModel");
const { ownsLessonResult } = require("../models/lessonResultModel");
const { isOwnedQuestionResult } = require("../models/questionResultModel");

const insertIncorrectPhonemeController = async (req, res) => {
  try {
    // Lấy studentId từ JWT token
    const studentId = req.user?.id;
    const { phoneme: errorMap, questionResultId, lessonResultId, questionId } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    if (!errorMap || !questionResultId || !lessonResultId || !questionId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ownsQuestionResult = await isOwnedQuestionResult(
      studentId,
      questionResultId,
      lessonResultId,
      questionId
    );
    if (!ownsQuestionResult) {
      return res.status(404).json({ message: "Speaking result not found" });
    }

    await insertOrUpdateIncorrectPhonemes(errorMap, questionResultId, lessonResultId, questionId, studentId);
    res.status(200).json({ message: "Insert/Update incorrect phonemes successfully" });
  } catch (err) {
    console.error("Insert/update incorrect phonemes failed");
    res.status(500).json({ message: "Insert/Update incorrect phonemes failed" });
  }
};

const getIncorrectPhonemesOfLessonController = async (req, res) => {
  const studentId = req.user?.id;
  const { lessonResultId } = req.params;
  if (!studentId) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
  if (!lessonResultId) {
    return res.status(400).json({ message: "Missing lessonResultId" });
  }

  try {
    const result = await getIncorrectPhonemesOfLesson(studentId, lessonResultId);
    res.status(200).json(result);
  } catch (err) {
    console.error("Get incorrect phonemes failed");
    res.status(500).json({ message: "Get incorrect phonemes failed" });
  }
};

const isValidResultId = value =>
  (typeof value === "string" || typeof value === "number") &&
  /^[1-9]\d*$/.test(String(value)) &&
  Number(value) <= 2147483647;

const getFeedbackSummaryController = async (req, res) => {
  const studentId = req.user?.id;
  const { lessonResultId } = req.query;

  if (!studentId) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
  if (!isValidResultId(lessonResultId)) {
    return res.status(400).json({ message: "A valid lessonResultId is required" });
  }

  try {
    const canReadResult = await ownsLessonResult(studentId, lessonResultId);
    if (!canReadResult) {
      return res.status(404).json({ message: "Lesson result not found" });
    }

    const rows = await getTopIncorrectPhonemesWithAvgScore(studentId, lessonResultId);
    // An owned result with no answers still has a metadata-only row.
    // No rows means it disappeared or ownership changed after the check.
    if (rows.length === 0) {
      return res.status(404).json({ message: "Lesson result not found" });
    }

    const lessonInfo = {
      lessonName: rows[0].lesson_name ?? null,
      lessonType: rows[0].lesson_type ?? null,
      finishedTime: rows[0].finishedtime ?? null,
      lessonScore: rows[0].lesson_score ?? null,
      questionCount: rows[0].question_count,
    };

    const questions = new Map();
    rows.forEach(row => {
      if (row.questionid == null) return;

      if (!questions.has(row.questionid)) {
        questions.set(row.questionid, {
          questionId: row.questionid,
          averageScores: {
            ieltsBand: row.ieltsband ?? null,
            accuracy: row.accuracy ?? null,
            fluency: row.fluency ?? null,
            completeness: row.completeness ?? null,
            pronunciation: row.pronunciation ?? null,
          },
          feedback: row.avg_feedback ?? "",
          topIncorrectPhonemes: [],
        });
      }
      if (row.phoneme != null) {
        questions.get(row.questionid).topIncorrectPhonemes.push({
          phoneme: row.phoneme,
          count: row.total_incorrect,
        });
      }
    });

    res.json({ lessonInfo, questions: Array.from(questions.values()) });
  } catch (err) {
    console.error("Failed to get feedback summary");
    res.status(500).json({ message: "Failed to get feedback summary" });
  }
};

const getLessonsSummaryController = async (req, res) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }

  try {
    const data = await getResultViews(studentId);

    // Format latestFinishedTime thành ISO string nếu có
    const formattedData = data.map(item => ({
      lessonId: item.lessonId,
      lessonName: item.lessonName,
      latestFinishedTime: item.latestFinishedTime ? item.latestFinishedTime.toISOString() : null,
      averageScore: item.averageScore,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch lessons summary');
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  insertIncorrectPhonemeController,
  getIncorrectPhonemesOfLessonController,
  getFeedbackSummaryController,
  getLessonsSummaryController,
};
