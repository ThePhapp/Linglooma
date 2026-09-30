jest.mock('../models/userModel');
jest.mock('bcrypt');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../controllers/authController');
const router = require('../routes/authRoutes');

const valid = { email: 'owner@example.com', password: 'password-123' };
const account = { id: 7, email: valid.email, password: 'stored-hash', username: 'Owner', gender: 'F', nationality: 'VN', phonenumber: '123' };
const invalidEmails = [undefined, null, false, 2, {}, [], '', 'a', 'a@localhost', 'a b@example.com', '.a@example.com', 'a.@example.com', 'a..b@example.com', 'a@@example.com', 'a@-example.com', 'a@example-.com', 'a@ex..com', 'a@' + 'b'.repeat(64) + '.com', 'a'.repeat(65) + '@example.com', 'a@' + ('b'.repeat(63) + '.').repeat(4) + 'com', 'x'.repeat(321)];
const invalidPasswords = [undefined, null, false, 12, {}, [], '', '1234567', 'x'.repeat(129)];
let res, logs;
const initialSecret = process.env.JWT_SECRET;
const initialExpiry = process.env.JWT_EXPIRE;
beforeEach(() => {
  process.env.JWT_SECRET = 'offline-auth-secret';
  delete process.env.JWT_EXPIRE;
  res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  logs = ['log', 'error', 'warn', 'info', 'debug'].map(method => jest.spyOn(console, method).mockImplementation(() => {}));
  User.findUserByEmail.mockResolvedValue({ rows: [] });
  User.insertUser.mockResolvedValue();
  bcrypt.hash.mockResolvedValue('new-hash');
  bcrypt.compare.mockResolvedValue(false);
});
afterEach(() => {
  for (const log of logs) expect(log).not.toHaveBeenCalled();
  if (initialSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = initialSecret;
  if (initialExpiry === undefined) delete process.env.JWT_EXPIRE; else process.env.JWT_EXPIRE = initialExpiry;
});

describe('registration', () => {
  it.each([undefined, null, false, 1, 'text', []])('rejects malformed body %p', async body => {
    await auth.register({ body }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findUserByEmail).not.toHaveBeenCalled();
  });
  it.each(invalidEmails)('rejects email %p', async email => {
    await auth.register({ body: { ...valid, email } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findUserByEmail).not.toHaveBeenCalled();
  });
  it.each(invalidPasswords)('rejects password %p', async password => {
    await auth.register({ body: { ...valid, password } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
  it.each(['12345678', '  secret  ', 'x'.repeat(128), '🔐'.repeat(8), '🔐'.repeat(128)])('accepts valid password without trimming (%p)', async password => {
    await auth.register({ body: { email: ' Owner@Example.COM ', password } }, res);
    expect(User.findUserByEmail).toHaveBeenCalledWith(valid.email);
    expect(bcrypt.hash).toHaveBeenCalledWith(Buffer.byteLength(password) > 72 ? expect.any(String) : password, 10);
    expect(User.insertUser).toHaveBeenCalledWith(valid.email, Buffer.byteLength(password) > 72 ? 'bcrypt-sha256:new-hash' : 'new-hash');
    expect(res.json).toHaveBeenCalledWith({ msg: 'Register successfully', success: true });
  });
  it('accepts a 254-character email with bounded labels', async () => {
    const email = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.' + 'd'.repeat(61);
    expect(email).toHaveLength(254);
    await auth.register({ body: { ...valid, email } }, res);
    expect(User.insertUser).toHaveBeenCalledWith(email, 'new-hash');
  });
  it('rejects a known duplicate before hashing', async () => {
    User.findUserByEmail.mockResolvedValue({ rows: [account] });
    await auth.register({ body: valid }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Email already exists' });
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
  it('handles a duplicate insert race identically', async () => {
    User.insertUser.mockRejectedValue(Object.assign(new Error('DB secret email'), { code: '23505' }));
    await auth.register({ body: valid }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Email already exists' });
  });
  it.each(['lookup', 'hash', 'insert'])('hides %s failures', async failure => {
    const target = { lookup: User.findUserByEmail, hash: bcrypt.hash, insert: User.insertUser }[failure];
    target.mockRejectedValue(new Error('password token provider DB secret'));
    await auth.register({ body: valid }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Register failed', success: false });
  });
});

describe('login', () => {
  const denied = { msg: 'Email or password is wrong', success: false };
  it.each([undefined, null, [], 'text', {}, ...invalidEmails.map(email => ({ ...valid, email })), ...invalidPasswords.filter(p => p !== '1234567').map(password => ({ ...valid, password }))])('returns generic invalid credentials for %p', async body => {
    await auth.login({ body }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(denied);
    expect(User.findUserByEmail).not.toHaveBeenCalled();
  });
  it.each([{ rows: [] }, { rows: [account] }, { rows: [{ ...account, password: null }] }])('equalizes missing user, wrong password and missing hash (%p)', async ({ rows }) => {
    User.findUserByEmail.mockResolvedValue({ rows });
    await auth.login({ body: valid }, res);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(denied);
  });
  it('never authenticates an absent user even if dummy comparison matches', async () => {
    bcrypt.compare.mockResolvedValue(true);
    await auth.login({ body: valid }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  it.each([[undefined, 3600], ['', 3600], ['garbage', 3600], ['0', 3600], ['-1', 3600], ['8d', 3600], ['Infinity', 3600], ['1h', 3600], ['15m', 900], ['60', 60], ['7d', 604800]])('bounds JWT lifetime %p to %p seconds', async (value, seconds) => {
    if (value !== undefined) process.env.JWT_EXPIRE = value;
    User.findUserByEmail.mockResolvedValue({ rows: [account] });
    bcrypt.compare.mockResolvedValue(true);
    const sign = jest.spyOn(jwt, 'sign');
    await auth.login({ body: { email: ' OWNER@example.com ', password: 'legacy' } }, res);
    expect(User.findUserByEmail).toHaveBeenCalledWith(valid.email);
    expect(bcrypt.compare).toHaveBeenCalledWith('legacy', account.password);
    expect(sign).toHaveBeenCalledWith({ id: 7, email: valid.email, name: 'Owner', phone: '123', gender: 'F', nationality: 'VN' }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: seconds });
    const result = res.json.mock.calls[0][0];
    expect(result).toEqual({ access_token: expect.any(String), msg: 'Login successful', success: true, user: { email: valid.email, name: 'Owner', phone: '123', gender: 'F', nationality: 'VN' } });
    const claims = jwt.verify(result.access_token, process.env.JWT_SECRET);
    expect(claims.exp - claims.iat).toBe(seconds);
    expect(claims.password).toBeUndefined();
  });
  it.each([undefined, '', '   '])('fails safely without a secret (%p)', async secret => {
    if (secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = secret;
    await auth.login({ body: valid }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Login failed', success: false });
    expect(User.findUserByEmail).not.toHaveBeenCalled();
  });
  it.each(['lookup', 'compare', 'sign', 'claims'])('hides %s failures', async failure => {
    User.findUserByEmail.mockResolvedValue({ rows: [account] });
    bcrypt.compare.mockResolvedValue(true);
    const error = new Error('password email token provider DB secret');
    if (failure === 'lookup') User.findUserByEmail.mockRejectedValue(error);
    if (failure === 'compare') bcrypt.compare.mockRejectedValue(error);
    if (failure === 'sign') jest.spyOn(jwt, 'sign').mockImplementation(() => { throw error; });
    if (failure === 'claims') User.findUserByEmail.mockResolvedValue({ rows: [{ ...account, id: null }] });
    await auth.login({ body: valid }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Login failed', success: false });
  });
});

it.each(['/register', '/login'])('retains the public POST %s handler', path => {
  const route = router.stack.find(layer => layer.route?.path === path).route;
  expect(route.methods.post).toBe(true);
  expect(route.stack).toHaveLength(1);
  expect(route.stack[0].handle).toBe(auth[path.slice(1)]);
});
