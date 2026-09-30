jest.mock('../models/userModel');
const bcrypt = require('bcrypt');
const { hashPassword, comparePassword } = require('../controllers/authController');

it.each(['12345678', '  secret  ', 'x'.repeat(72), 'x'.repeat(73), 'x'.repeat(128), '🔐'.repeat(128)])('round-trips passwords without losing trailing characters (%p)', async password => {
  const hash = await hashPassword(password);
  expect(await comparePassword(password, hash)).toBe(true);
  expect(await comparePassword(password.slice(0, -1) + 'z', hash)).toBe(false);
  expect(hash.startsWith('bcrypt-sha256:')).toBe(Buffer.byteLength(password) > 72);
});
it('supports existing bcrypt hashes for legacy short passwords', async () => {
  const hash = await bcrypt.hash('legacy', 10);
  expect(await comparePassword('legacy', hash)).toBe(true);
  expect(await comparePassword('wrong', hash)).toBe(false);
});
it('keeps the fixed dummy comparison valid and rejects missing hashes', async () => {
  expect(await comparePassword('password-123', undefined)).toBe(false);
});
