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
    return res.rows;
  } catch (error) {
    console.error('Failed to query speaking history');
    throw error;
  }
}

async function getRetryComparison(studentId, lessonResultId) {
  const result = await client.query(
    `WITH target AS (
       SELECT lessonid FROM lessonresult WHERE id = $1 AND studentid = $2
     ), recent AS (
       SELECT lr.id, lr.finishedtime, lr.averagescore, lr.feedback
       FROM lessonresult lr INNER JOIN target t ON t.lessonid = lr.lessonid
       WHERE lr.studentid = $2 ORDER BY lr.finishedtime DESC, lr.id DESC LIMIT 2
     )
     SELECT r.id, r.finishedtime AS completed_at, r.averagescore AS score, r.feedback,
            ROUND(AVG(qr.accuracy)::numeric, 1) AS accuracy,
            ROUND(AVG(qr.fluency)::numeric, 1) AS fluency,
            ROUND(AVG(qr.pronunciation)::numeric, 1) AS pronunciation,
            STRING_AGG(qr.transcription, ' ' ORDER BY qr.id) FILTER (WHERE qr.transcription IS NOT NULL) AS transcript
     FROM recent r LEFT JOIN questionresult qr ON qr.lessonresultid = r.id AND qr.studentid = $2
     GROUP BY r.id, r.finishedtime, r.averagescore, r.feedback
     ORDER BY r.finishedtime ASC, r.id ASC`,
    [lessonResultId, studentId]
  );
  return result.rows;
}

module.exports = {
    insertLessonResult,
    isQuestionInOwnedLessonResult,
    ownsLessonResult,
    getLessonResult,
    getRecentlyLessonResult,
    getSpeakingHistory,
    getRetryComparison
};
