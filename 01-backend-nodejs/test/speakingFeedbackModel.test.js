// Query-contract tests: PostgreSQL is mocked; these do not execute SQL.
jest.mock('../db', () => ({ query: jest.fn() }));

const db = require('../db');
const {
  getTopIncorrectPhonemesWithAvgScore,
  getIncorrectPhonemesOfLesson,
} = require('../models/incorrectphonemesModel');

beforeEach(() => jest.resetAllMocks());

async function summaryQuery(rows = []) {
  db.query.mockResolvedValue({ rows });
  const result = await getTopIncorrectPhonemesWithAvgScore(7, '10');
  expect(db.query).toHaveBeenCalledTimes(1);
  expect(db.query.mock.calls[0][1]).toEqual(['10', 7]);
  return { sql: db.query.mock.calls[0][0].replace(/\s+/g, ' ').trim(), result };
}

test('preserves metadata-only rows when the owned lesson has no question results', async () => {
  const rows = [{ lesson_name: 'Real lesson', question_count: '4', questionid: null }];
  const { sql, result } = await summaryQuery(rows);

  expect(result).toEqual(rows);
  expect(sql).toContain('FROM OwnedResult lr LEFT JOIN lesson l ON l.id = lr.lessonId LEFT JOIN LatestResults qr');
  expect(sql).toContain('lr.averagescore AS lesson_score');
});

test('retains latest question scores and feedback regardless of phoneme errors', async () => {
  const rows = [{ questionid: 3, ieltsband: 7, avg_feedback: 'Real feedback', phoneme: null }];
  const { sql, result } = await summaryQuery(rows);

  expect(result).toEqual(rows);
  expect(sql).toContain('SELECT DISTINCT ON (qr.questionId) qr.*');
  expect(sql).toContain('ORDER BY qr.questionId, qr.id DESC');
  expect(sql).toContain('qr.feedback AS avg_feedback');
  expect(sql).toContain('LEFT JOIN TopPhonemes tp ON tp.questionId = qr.questionId AND tp.rank <= 3');
  // A WHERE on the final left joins would erase unanswered/error-free results.
  expect(sql.slice(sql.lastIndexOf('FROM OwnedResult lr'))).not.toMatch(/\bWHERE\b/);
});

test('scopes lesson and question results to the same authenticated owner', async () => {
  const { sql, result } = await summaryQuery();

  expect(result).toEqual([]);
  expect(sql).toContain('FROM lessonresult WHERE id = $1 AND studentId = $2');
  expect(sql).toContain('INNER JOIN OwnedResult lr ON qr.lessonResultId = lr.id AND qr.studentId = lr.studentId');
});

test('excludes foreign, mismatched, and earlier-attempt phonemes from latest feedback', async () => {
  const { sql } = await summaryQuery();

  expect(sql).toContain('FROM LatestResults qr INNER JOIN incorrectphonemes ip');
  expect(sql).toContain('ip.questionResultId = qr.id');
  expect(sql).toContain('ip.lessonResultId = qr.lessonResultId');
  expect(sql).toContain('ip.questionId = qr.questionId');
  expect(sql).toContain('ip.studentId = qr.studentId');
  expect(sql).toContain('ip.phoneme IS NOT NULL AND ip.incorrect_count > 0');
  expect(sql).toContain('PARTITION BY questionId ORDER BY total_incorrect DESC, phoneme');
});

test('raw phoneme reads also require matching lesson and question result ownership', async () => {
  db.query.mockResolvedValue({ rows: [] });

  await expect(getIncorrectPhonemesOfLesson(7, '10')).resolves.toEqual([]);

  const [query, params] = db.query.mock.calls[0];
  const sql = query.replace(/\s+/g, ' ');
  expect(params).toEqual([7, '10']);
  expect(sql).toContain('ip.lessonResultId = lr.id AND ip.studentId = lr.studentId');
  expect(sql).toContain('ip.questionResultId = qr.id');
  expect(sql).toContain('ip.lessonResultId = qr.lessonResultId');
  expect(sql).toContain('ip.questionId = qr.questionId');
  expect(sql).toContain('ip.studentId = qr.studentId');
  expect(sql).toContain('WHERE ip.studentId = $1 AND ip.lessonResultId = $2');
});
