jest.mock('../db', () => ({ query: jest.fn() }));

const db = require('../db');
const lessonResultModel = require('../models/lessonResultModel');
const questionResultModel = require('../models/questionResultModel');

describe('speaking result model return values', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns lesson result rows', async () => {
    const rows = [{ id: 1 }];
    db.query.mockResolvedValue({ rows });

    await expect(lessonResultModel.getLessonResult(7, 2)).resolves.toEqual(rows);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('studentId=$1'), [7, 2]);
  });

  it('awaits and returns recent lesson result rows', async () => {
    const rows = [{ id: 2 }];
    db.query.mockResolvedValue({ rows });

    await expect(lessonResultModel.getRecentlyLessonResult(7)).resolves.toEqual(rows);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $2'), [7, 7]);
  });

  it('returns the generated question result', async () => {
    const row = { id: 50, studentid: 7, lessonresultid: 10, questionid: 100 };
    db.query.mockResolvedValue({ rows: [row] });

    await expect(questionResultModel.insertQuestionResult(
      7, 10, 100, 7, 80, 75, 90, 78, 'Good work'
    )).resolves.toEqual(row);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('RETURNING *'),
      [7, 10, 100, 7, 80, 75, 90, 78, 'Good work']
    );
  });
});
