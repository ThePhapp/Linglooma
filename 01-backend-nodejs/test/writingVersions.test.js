jest.mock('../db', () => ({ query: jest.fn(), connect: jest.fn() }));

const db = require('../db');
const model = require('../models/writingModel');
const controller = require('../controllers/writingController');
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

beforeEach(() => jest.clearAllMocks());

test('lists only writing versions owned by the authenticated learner', async () => {
  db.query.mockResolvedValue({ rows: [{ id: 1, version_no: 1 }] });
  await expect(model.getWritingVersions(7, 11)).resolves.toEqual([{ id: 1, version_no: 1 }]);
  expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/submission_id = \$1 AND user_id = \$2/), [7, 11]);
});

test('adds a numbered learner revision without changing the original submission', async () => {
  db.query.mockResolvedValue({ rows: [{ id: 2, version_no: 2, version_type: 'revision' }] });
  await expect(model.addWritingRevision(7, 11, 'A revised essay with enough words for this focused unit test.')).resolves.toMatchObject({ version_no: 2 });
  expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO writing_versions/), [7, 11, expect.any(String), 11]);
});

test('revision endpoint rejects short content before accessing storage', async () => {
  const res = response();
  await controller.addWritingRevision({ user: { id: 11 }, params: { submissionId: '7' }, body: { essayText: 'Too short' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(db.query).not.toHaveBeenCalled();
});
