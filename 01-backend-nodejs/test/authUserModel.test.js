jest.mock('../db', () => ({ query: jest.fn() }));
const db = require('../db');
const User = require('../models/userModel');

it('uses parameterized case-insensitive lookup and update for the same identity', async () => {
  const email = "Owner@example.com' OR 1=1 --";
  db.query.mockResolvedValue({ rows: [] });
  await User.findUserByEmail(email);
  await User.updateUser(email, 'owner', 'hash', 'F', 'VN', '123');
  expect(db.query.mock.calls[0]).toEqual([expect.stringContaining('LOWER(email) = LOWER($1)'), [email]]);
  expect(db.query.mock.calls[1]).toEqual([expect.stringContaining('LOWER(email) = LOWER($6)'), ['owner', 'hash', 'F', 'VN', '123', email]]);
});
it('only inserts a supplied hash through bound parameters', async () => {
  await User.insertUser('owner@example.com', 'hashed-password');
  expect(db.query).toHaveBeenCalledWith('INSERT INTO users (email, password) VALUES ($1, $2)', ['owner@example.com', 'hashed-password']);
});
