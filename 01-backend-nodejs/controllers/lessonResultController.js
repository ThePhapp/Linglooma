const { insertLessonResult, getLessonResult, getRecentlyLessonResult, getSpeakingHistory } = require('../models/lessonResultModel');

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

module.exports = {
  insertLessonResultController,
  getLessonResultController,
  getRecentlyLessonResultController,
  getSpeakingHistoryController
};
