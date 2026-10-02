const { insertLessonResult, getLessonResult, getRecentlyLessonResult, getSpeakingHistory, getRetryComparison } = require('../models/lessonResultModel');

const insertLessonResultController = async (req, res) => {
  try {
    // Lấy studentId từ JWT token thay vì req.body
    const studentId = req.user?.id;
    const { lessonId, finishedTime, averageScore, feedback } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    if (!lessonId || !finishedTime || averageScore == null) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const inserted = await insertLessonResult({ studentId, lessonId, finishedTime, averageScore, feedback });
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Failed to insert lesson result');
    res.status(500).json({ message: "Error inserting lesson result" });
  }
};

const getLessonResultController = async (req, res) => {
  const studentId = req.user?.id;
  const { lessonId } = req.query;

  if (!studentId) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }

  if (!lessonId) {
    return res.status(400).json({ message: "Missing lessonId" });
  }

  try {
    const results = await getLessonResult(studentId, lessonId);
    res.status(200).json(results);
  } catch (error) {
    console.error('Failed to fetch lesson result');
    res.status(500).json({ message: "Error fetching lesson result" });
  }
};

const getRecentlyLessonResultController = async (req, res) => {
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }

  try {
    const results = await getRecentlyLessonResult(studentId);
    res.status(200).json(results);
  } catch (error) {
    console.error('Failed to fetch recent lesson results');
    res.status(500).json({ message: "Error fetching recent lesson results" });
  }
};

const getSpeakingHistoryController = async (req, res) => {
  try {
    const studentId = req.user.id; // From JWT middleware
    
    if (!studentId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const results = await getSpeakingHistory(studentId);
    res.status(200).json(results);
  } catch (error) {
    console.error('Failed to fetch speaking history');
    res.status(500).json({ message: "Error fetching speaking history" });
  }
};

const getRetryComparisonController = async (req, res) => {
  if (!/^(?:[1-9]\d*)$/.test(String(req.params.lessonResultId))) return res.status(400).json({ message: 'Invalid speaking result ID' });
  try {
    const attempts = await getRetryComparison(req.user.id, req.params.lessonResultId);
    if (!attempts.length) return res.status(404).json({ message: 'Speaking result not found' });
    const first = attempts[0];
    const latest = attempts[attempts.length - 1];
    const delta = field => attempts.length < 2 || first[field] == null || latest[field] == null ? null : Math.round((Number(latest[field]) - Number(first[field])) * 10) / 10;
    return res.json({ attempts, comparison: { score: delta('score'), accuracy: delta('accuracy'), fluency: delta('fluency'), pronunciation: delta('pronunciation') } });
  } catch {
    return res.status(500).json({ message: 'Speaking comparison could not be loaded' });
  }
};

module.exports = {
  insertLessonResultController,
  getLessonResultController,
  getRecentlyLessonResultController,
  getSpeakingHistoryController,
  getRetryComparisonController
};
