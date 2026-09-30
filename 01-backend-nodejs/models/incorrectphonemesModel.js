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
      console.error('Failed to upsert incorrect phoneme');
      throw error;
    }
  }
};

// Lấy tất cả phonemes sai của một học viên cho một câu hỏi trong bài học
const getIncorrectPhonemesOfLesson = async (studentId, lessonResultId) => {
  const result = await client.query(
    `
    SELECT ip.*, lr.*, q.*
    FROM incorrectphonemes ip
    INNER JOIN lessonResult lr
      ON ip.lessonResultId = lr.id AND ip.studentId = lr.studentId
    INNER JOIN questionResult qr
      ON ip.questionResultId = qr.id
      AND ip.lessonResultId = qr.lessonResultId
      AND ip.questionId = qr.questionId
      AND ip.studentId = qr.studentId
    INNER JOIN question q
      ON ip.questionId = q.id
    WHERE ip.studentId = $1 AND ip.lessonResultId = $2
    `,
    [studentId, lessonResultId]
  );

  return result.rows;
};

const getTopIncorrectPhonemesWithAvgScore = async (studentId, lessonResultId) => {
  const result = await client.query(
    `
    WITH OwnedResult AS (
      SELECT *
      FROM lessonresult
      WHERE id = $1 AND studentId = $2
    ),
    LatestResults AS (
      SELECT DISTINCT ON (qr.questionId) qr.*
      FROM questionResult qr
      INNER JOIN OwnedResult lr
        ON qr.lessonResultId = lr.id AND qr.studentId = lr.studentId
      ORDER BY qr.questionId, qr.id DESC
    ),
    PhonemeCounts AS (
      SELECT
        qr.questionId,
        ip.phoneme,
        SUM(ip.incorrect_count) AS total_incorrect
      FROM LatestResults qr
      INNER JOIN incorrectphonemes ip
        ON ip.questionResultId = qr.id
        AND ip.lessonResultId = qr.lessonResultId
        AND ip.questionId = qr.questionId
        AND ip.studentId = qr.studentId
      WHERE ip.phoneme IS NOT NULL AND ip.incorrect_count > 0
      GROUP BY qr.questionId, ip.phoneme
    ),
    TopPhonemes AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY questionId ORDER BY total_incorrect DESC, phoneme
        ) AS rank
      FROM PhonemeCounts
    )
    SELECT
      l.name AS lesson_name,
      l.type AS lesson_type,
      lr.finishedtime,
      lr.averagescore AS lesson_score,
      (SELECT COUNT(*) FROM question WHERE lessonid = lr.lessonid) AS question_count,
      qr.questionId,
      qr.ieltsBand,
      qr.accuracy,
      qr.fluency,
      qr.completeness,
      qr.pronunciation,
      qr.feedback AS avg_feedback,
      tp.phoneme,
      tp.total_incorrect
    FROM OwnedResult lr
    LEFT JOIN lesson l ON l.id = lr.lessonId
    LEFT JOIN LatestResults qr ON qr.lessonResultId = lr.id
    LEFT JOIN TopPhonemes tp ON tp.questionId = qr.questionId AND tp.rank <= 3
    ORDER BY qr.questionId, tp.rank
    `,
    [lessonResultId, studentId]
  );

  // LEFT JOIN preserves lesson metadata even when there are no question results.
  return result.rows;
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
