jest.mock('../db', () => ({ query: jest.fn() }));
const db = require('../db');
const { findLessons } = require('../models/lessonModel');

test('lists only active lessons with public catalog fields', async () => {
  db.query.mockResolvedValue({ rows: [] });
  await findLessons();
  const [sql, params] = db.query.mock.calls[0];
  expect(params).toBeUndefined();
  expect(sql).toContain('SELECT id, name, type, image, description, difficulty');
  expect(sql).toContain('WHERE is_active = true');
  expect(sql).not.toContain('SELECT *');
});
