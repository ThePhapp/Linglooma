const { insertLessonResult, getLessonResult, getRecentlyLessonResult, getSpeakingHistory } = require('../models/lessonResultModel');

const insertLessonResultController = async (req, res) => {
  try {
    // Lấy studentId từ JWT token thay vì req.body
    const studentId = req.user?.id;
    const { lessonId, finishedTime, averageScore, feedback } = req.body;

    if (!studentId) {
      console.error('❌ No studentId found in JWT token');
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    if (!lessonId || !finishedTime || averageScore == null) {
      console.error('❌ Missing parameters:', { lessonId, finishedTime, averageScore });
      return res.status(400).json({ message: "Missing parameters" });
    }

    console.log('📝 Inserting lesson result for studentId:', studentId, 'lessonId:', lessonId);
    const inserted = await insertLessonResult({ studentId, lessonId, finishedTime, averageScore, feedback });
    console.log('✅ Lesson result inserted successfully:', inserted);
    res.status(201).json(inserted);
  } catch (error) {
    console.error('❌ Error inserting lesson result:', error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ message: "Error fetching recent lesson results" });
  }
};

const getSpeakingHistoryController = async (req, res) => {
  try {
    console.log('🔍 Getting speaking history for user:', req.user);
    const studentId = req.user.id; // From JWT middleware
    
    if (!studentId) {
      console.error('❌ No studentId found in JWT token');
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    console.log('📊 Fetching speaking history for studentId:', studentId);
    const results = await getSpeakingHistory(studentId);
    console.log('✅ Found', results.length, 'speaking history records');
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error fetching speaking history:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: "Error fetching speaking history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  insertLessonResultController,
  getLessonResultController,
  getRecentlyLessonResultController,
  getSpeakingHistoryController
};
