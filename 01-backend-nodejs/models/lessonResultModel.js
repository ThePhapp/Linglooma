const client = require('../db');

const lastestScore = 7;

async function insertLessonResult({ studentId, lessonId, finishedTime, averageScore, feedback }) {
  const query = `
    INSERT INTO lessonResult (studentId, lessonId, finishedTime, averageScore, feedback)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [studentId, lessonId, finishedTime, averageScore, feedback];

  const res = await client.query(query, values);
  return res.rows[0];
}

async function isQuestionInOwnedLessonResult(studentId, lessonResultId, questionId) {
  const result = await client.query(
    `
      SELECT 1
      FROM lessonResult lr
      INNER JOIN question q ON q.lessonId = lr.lessonId
      WHERE lr.id = $1 AND lr.studentId = $2 AND q.id = $3
      LIMIT 1
    `,
    [lessonResultId, studentId, questionId]
  );

  return result.rows.length > 0;
}

async function ownsLessonResult(studentId, lessonResultId) {
  const result = await client.query(
    'SELECT 1 FROM lessonResult WHERE id = $1 AND studentId = $2 LIMIT 1',
    [lessonResultId, studentId]
  );

  return result.rows.length > 0;
}


const getLessonResult = async (studentId, lessonId) => {
    const result = await client.query(
        'SELECT * FROM lessonResult WHERE studentId=$1 AND lessonId=$2',
        [studentId, lessonId]
    );
    return result.rows;
}

const getRecentlyLessonResult = async (studentId) => {
    const result = await client.query(
        `
        SELECT * 
        FROM lessonresult
        WHERE studentId=$1
        ORDER BY finishedTime DESC
        LIMIT $2;
        `,
        [studentId, lastestScore]
    );
    return result.rows;
}

async function getSpeakingHistory(studentId) {
  try {
    console.log('🗄️ Database query for studentId:', studentId);
    const query = `
      SELECT 
        lr.id,
        lr.lessonid as lesson_id,
        lr.finishedtime as completed_at,
        lr.averagescore as ielts_band,
        lr.feedback,
        l.name as lesson_title,
        (SELECT COUNT(*) FROM question WHERE lessonid = lr.lessonid) as question_count
      FROM lessonresult lr
      LEFT JOIN lesson l ON lr.lessonid = l.id
      WHERE lr.studentid = $1
      ORDER BY lr.finishedtime DESC
    `;
    
    const res = await client.query(query, [studentId]);
    console.log('✅ Database returned', res.rows.length, 'rows');
    return res.rows;
  } catch (error) {
    console.error('❌ Database error in getSpeakingHistory:', error.message);
    throw error;
  }
}

module.exports = {
    insertLessonResult,
    isQuestionInOwnedLessonResult,
    ownsLessonResult,
    getLessonResult,
    getRecentlyLessonResult,
    getSpeakingHistory
};
