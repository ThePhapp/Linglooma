const client = require("../db");

const upsertIncorrectPhoneme = async (
  phoneme,
  count,
  questionResultId,
  lessonResultId,
  questionId,
  studentId
) => {
  const lessonExistsResult = await client.query(
    `SELECT 1 FROM incorrectphonemes WHERE lessonResultId = $1 LIMIT 1`,
    [lessonResultId]
  );

  if (lessonExistsResult.rows.length === 0) {
    await client.query(
      `
      INSERT INTO incorrectphonemes (phoneme, questionResultId, lessonResultId, questionId, studentId, incorrect_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [phoneme, questionResultId, lessonResultId, questionId, studentId, count]
    );
  } else {
    const phonemeExistResult = await client.query(
      `
      SELECT id, incorrect_count
      FROM incorrectphonemes
      WHERE phoneme = $1 AND lessonResultId = $2
      `,
      [phoneme, lessonResultId]
    );

    if (phonemeExistResult.rows.length > 0) {
      const existingRecord = phonemeExistResult.rows[0];
      const newCount = existingRecord.incorrect_count + count;

      await client.query(
        `
        UPDATE incorrectphonemes
        SET incorrect_count = $1
        WHERE id = $2
        `,
        [newCount, existingRecord.id]
      );
    } else {
      await client.query(
        `
        INSERT INTO incorrectphonemes (phoneme, questionResultId, lessonResultId, questionId, studentId, incorrect_count)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          phoneme,
          questionResultId,
          lessonResultId,
          questionId,
          studentId,
          count,
        ]
      );
    }
  }
};

const insertOrUpdateIncorrectPhonemes = async (
  errorMap,
  questionResultId,
  lessonResultId,
  questionId,
  studentId
) => {
  for (const [phoneme, count] of Object.entries(errorMap)) {
    try {
      await upsertIncorrectPhoneme(
        phoneme,
        count,
        questionResultId,
        lessonResultId,
        questionId,
        studentId
      );
    } catch (error) {
      console.error(`Error upserting phoneme "${phoneme}":`, error);
      throw error;
    }
  }
};

// Lấy tất cả phonemes sai của một học viên cho một câu hỏi trong bài học
const getIncorrectPhonemesOfLesson = async (studentId, lessonResultId) => {
  const result = await client.query(
    `
    SELECT * 
    FROM incorrectphonemes ip
    INNER JOIN lessonResult lr
      ON ip.lessonResultId = lr.id
    INNER JOIN question q
      ON ip.questionId = q.id
    WHERE ip.studentId = $1 AND ip.lessonResultId = $2
    `,
    [studentId, lessonResultId]
  );

  return result.rows;
};

const getTopIncorrectPhonemesWithAvgScore = async (studentId, lessonResultId) => {
  try {
    // First, get lesson info separately to ensure we always have it
    const lessonInfoResult = await client.query(
      `
      SELECT
        lr.id,
        lr.lessonid,
        lr.finishedtime,
        lr.averagescore,
        l.name as lesson_name,
        l.type as lesson_type,
        (SELECT COUNT(*) FROM question WHERE lessonid = lr.lessonid) as question_count
      FROM lessonresult lr
      LEFT JOIN lesson l ON lr.lessonid = l.id
      WHERE lr.id = $1 AND lr.studentId = $2
      `,
      [lessonResultId, studentId]
    );

    const lessonInfo = lessonInfoResult.rows[0] || null;

    // Then get phoneme data
    const result = await client.query(
      `
      WITH PhonemeCounts AS (
        SELECT
          questionId,
          phoneme,  
          SUM(incorrect_count) AS total_incorrect
        FROM incorrectphonemes
        WHERE lessonresultid = $1 AND studentId = $2
        GROUP BY questionId, phoneme
      ),
      TopPhonemes AS (
        SELECT
          questionId,
          phoneme,
          total_incorrect,
          RANK() OVER (PARTITION BY questionId ORDER BY total_incorrect DESC) as rank
        FROM PhonemeCounts
      ),
      AvgScores AS (
        SELECT DISTINCT ON (questionId)
    questionId,
    ieltsBand,
    accuracy,
    fluency,
    completeness,
    pronunciation
  FROM questionResult
  WHERE lessonresultid = $1 AND studentId = $2
  ORDER BY questionId, id DESC
      ),
      LatestFeedback AS (
        SELECT DISTINCT ON (questionId)
          questionId,
          feedback
        FROM questionResult
        WHERE lessonresultid = $1 AND studentId = $2
        ORDER BY questionId, id DESC
      )
      
      SELECT
        tp.questionId,
        tp.phoneme,
        tp.total_incorrect,
        a.ieltsBand,
        a.accuracy,
        a.fluency,
        a.completeness,
        a.pronunciation,
        lf.feedback AS avg_feedback
      FROM TopPhonemes tp
      LEFT JOIN AvgScores a ON tp.questionId = a.questionId
      LEFT JOIN LatestFeedback lf ON tp.questionId = lf.questionId
      WHERE tp.rank <= 3
      ORDER BY tp.questionId, tp.rank;
    `,
      [lessonResultId, studentId]
    );

    // Attach lesson info to each row
    return result.rows.map(row => ({
      ...row,
      lesson_name: lessonInfo?.lesson_name,
      lesson_type: lessonInfo?.lesson_type,
      finishedtime: lessonInfo?.finishedtime,
      lesson_score: lessonInfo?.averagescore,
      question_count: lessonInfo?.question_count
    }));
  } catch (error) {
    console.error("Error in getTopIncorrectPhonemesWithAvgScore:", error);
    throw error;
  }
};

const getResultViews = async (studentId) => {
  const query = `
SELECT
  l.id AS "lessonId",
  l.name AS "lessonName",
  MAX(lr."finishedtime") AS "latestFinishedTime",
  AVG(lr."averagescore") AS "averageScore"
FROM lesson l
INNER JOIN lessonResult lr ON l.id = lr.lessonid
WHERE lr.studentId = $1
GROUP BY l.id, l.name
ORDER BY l.id;
  `;

  const { rows } = await client.query(query, [studentId]);
  return rows.map(row => ({
    lessonId: row.lessonId,
    lessonName: row.lessonName,
    latestFinishedTime: row.latestFinishedTime,
    averageScore: row.averageScore !== null ? parseFloat(row.averageScore) : null,
  }));
};

module.exports = {
  upsertIncorrectPhoneme,
  insertOrUpdateIncorrectPhonemes,
  getIncorrectPhonemesOfLesson,
  getTopIncorrectPhonemesWithAvgScore,
  getResultViews,
};
