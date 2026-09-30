const client = require('../db');

const insertQuestionResult = async (
  studentId,
  lessonResultId,
  questionId,
  ieltsBand,
  accuracy,
  fluency,
  completeness,
  pronunciation,
  feedback
) => {
  const result = await client.query(
    `
    INSERT INTO questionResult
      (studentId, lessonResultId, questionId, ieltsBand, accuracy, fluency, completeness, pronunciation, feedback)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [studentId, lessonResultId, questionId, ieltsBand, accuracy, fluency, completeness, pronunciation, feedback]
  );

  return result.rows[0];
};


const getQuestionResultOfLesson = async (studentId, lessonResultId) => {
    const result = await client.query(
        `
        SELECT * 
        FROM questionResult qr
        INNER JOIN lessonResult lr 
        ON lr.id = qr.lessonResultId AND qr.studentId = lr.studentId
        WHERE qr.studentId=$1 AND qr.lessonResultId=$2;
        `,
        [studentId, lessonResultId]
    );

    return result;
};

const isOwnedQuestionResult = async (studentId, questionResultId, lessonResultId, questionId) => {
  const result = await client.query(
    `
      SELECT 1
      FROM questionResult qr
      INNER JOIN lessonResult lr
        ON lr.id = qr.lessonResultId AND lr.studentId = qr.studentId
      WHERE qr.id = $1
        AND qr.studentId = $2
        AND qr.lessonResultId = $3
        AND qr.questionId = $4
      LIMIT 1
    `,
    [questionResultId, studentId, lessonResultId, questionId]
  );

  return result.rows.length > 0;
};

module.exports = {
    insertQuestionResult, 
    getQuestionResultOfLesson, 
    isOwnedQuestionResult,
};
