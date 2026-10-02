jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('../models/learningIntelligenceModel', () => ({
  getProfile: jest.fn().mockResolvedValue(null),
  getStudyPlan: jest.fn().mockResolvedValue([]),
  listMistakes: jest.fn().mockResolvedValue([]),
  getActiveSessions: jest.fn().mockResolvedValue([])
}));

const db = require('../db');
const learningModel = require('../models/learningModel');
const learningController = require('../controllers/learningController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

beforeEach(() => jest.clearAllMocks());

test('normalizes and sorts persisted history across all four skills', async () => {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: 1, lesson_id: 3, activity: 'Travel', score: 6.5, completed_at: '2026-09-01T10:00:00Z' }] })
    .mockResolvedValueOnce({ rows: [{ id: 2, activity: 'Task 2', score: null, is_completed: false, completed_at: '2026-09-03T10:00:00Z' }] })
    .mockResolvedValueOnce({ rows: [{ id: 4, passage_id: 8, activity: 'Cities', score: '75.00', completed_at: '2026-09-02T10:00:00Z' }] })
    .mockResolvedValueOnce({ rows: [{ id: 5, activity: 'Daily Routine', score: '80.00', completed_at: '2026-09-04T10:00:00Z' }] });

  const history = await learningModel.getPracticeHistory(9);

  expect(db.query).toHaveBeenCalledTimes(4);
  db.query.mock.calls.forEach(([, params]) => expect(params).toEqual([9]));
  expect(history.map(item => item.id)).toEqual(['listening-5', 'writing-2', 'reading-4', 'speaking-1']);
  expect(history[0]).toMatchObject({ skill: 'listening', score: 80, scoreScale: 100 });
  expect(history[1]).toMatchObject({ skill: 'writing', status: 'feedback_pending', score: null });
  expect(history[2]).toMatchObject({ skill: 'reading', score: 75, scoreScale: 100 });
});

test('calculates only real scored averages and exposes missing skills explicitly', () => {
  const progress = learningModel.calculateProgress([
    { skill: 'speaking', score: 6, scoreScale: 9, status: 'completed', completedAt: '2026-09-02T00:00:00Z' },
    { skill: 'speaking', score: 7, scoreScale: 9, status: 'completed', completedAt: '2026-09-01T00:00:00Z' },
    { skill: 'writing', score: null, scoreScale: 9, status: 'feedback_pending', completedAt: '2026-09-03T00:00:00Z' }
  ]);

  expect(progress.find(item => item.skill === 'speaking')).toMatchObject({ score: 6.5, attempts: 2, hasData: true });
  expect(progress.find(item => item.skill === 'writing')).toMatchObject({ score: null, attempts: 1, hasData: true });
  expect(progress.find(item => item.skill === 'listening')).toMatchObject({ score: null, attempts: 0, hasData: false });
});

test('prioritizes pending feedback and the weakest normalized skill', () => {
  const history = [
    { id: 'writing-2', skill: 'writing', status: 'feedback_pending', href: '/writing/2' },
    { id: 'reading-1', skill: 'reading', status: 'completed' },
    { id: 'speaking-1', skill: 'speaking', status: 'completed' }
  ];
  const progress = [
    { skill: 'speaking', score: 6.5, scoreScale: 9 },
    { skill: 'writing', score: null, scoreScale: 9 },
    { skill: 'reading', score: 50, scoreScale: 100 },
    { skill: 'listening', score: null, scoreScale: 100 }
  ];

  const recommendations = learningModel.buildRecommendations(progress, history);
  expect(recommendations[0]).toMatchObject({ id: 'writing-feedback-pending', href: '/writing/2' });
  expect(recommendations[1]).toMatchObject({ id: 'focus-reading', skill: 'reading' });
});

test('history controller rejects unsupported filters before returning data', async () => {
  jest.spyOn(learningModel, 'getPracticeHistory').mockResolvedValue([]);
  const res = response();
  await learningController.getHistory({ user: { id: 9 }, query: { skill: 'grammar' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  learningModel.getPracticeHistory.mockRestore();
});
