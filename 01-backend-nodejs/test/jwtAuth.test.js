const jwt = require('jsonwebtoken');
const jwtauth = require('../middleware/jwtauth');
let req, res, next, logs;
const secret = 'offline-jwt-secret';
const originalSecret = process.env.JWT_SECRET;
const claims = { id: 7, email: 'owner@example.com', name: 'Owner' };
const token = (payload = claims, options = {}) => jwt.sign(payload, secret, { expiresIn: '1h', ...options });
beforeEach(() => {
  process.env.JWT_SECRET = secret;
  req = { method: 'PUT', originalUrl: '/api/users/update', headers: {}, user: { id: 999 } };
  res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  next = jest.fn();
  logs = ['log', 'warn', 'error', 'info', 'debug'].map(method => jest.spyOn(console, method).mockImplementation(() => {}));
});
afterEach(() => {
  for (const log of logs) expect(log).not.toHaveBeenCalled();
  if (originalSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = originalSecret;
});
function expectDenied() {
  jwtauth(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired authentication token' });
  expect(next).not.toHaveBeenCalled();
  expect(req.user).toBeUndefined();
}
it.each([undefined, null, '', 1, {}, [], 'Basic x.y.z', 'Bearer', 'Bearer a', 'Bearer a.b.c extra', 'Bearer  a.b.c', ' Bearer a.b.c', 'Bearer a.b.c ', 'Bearer a.b.c\n', 'Bearer a..c', 'Bearer ' + 'x'.repeat(8193)])('rejects malformed authorization %p', value => {
  req.headers.authorization = value;
  expectDenied();
});
it('handles missing headers safely', () => { delete req.headers; expectDenied(); });
it.each(['newline', 'leading space', 'trailing space', 'extra token', 'wrong scheme', 'double space'])('rejects %s even around a valid token', variant => {
  const validToken = token();
  req.headers.authorization = {
    newline: `Bearer ${validToken}\n`,
    'leading space': ` Bearer ${validToken}`,
    'trailing space': `Bearer ${validToken} `,
    'extra token': `Bearer ${validToken} extra`,
    'wrong scheme': `Basic ${validToken}`,
    'double space': `Bearer  ${validToken}`
  }[variant];
  expectDenied();
});
it.each(['Bearer', 'bearer', 'BEARER'])('accepts %s with valid claims and projects identity', scheme => {
  req.headers.authorization = `${scheme} ${token({ ...claims, email: ' OWNER@Example.com ', password: 'must-not-copy', admin: true })}`;
  jwtauth(req, res, next);
  expect(next).toHaveBeenCalledTimes(1);
  expect(req.user).toEqual({ ...claims, phone: undefined, gender: undefined, nationality: undefined });
  expect(res.status).not.toHaveBeenCalled();
});
it.each([undefined, '', '  '])('rejects secret absence %p', value => {
  req.headers.authorization = `Bearer ${token()}`;
  if (value === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = value;
  expectDenied();
});
it.each([
  ['expired', () => token(claims, { expiresIn: -1 })],
  ['future activation', () => token(claims, { notBefore: '1h' })],
  ['wrong secret', () => jwt.sign(claims, 'another-secret', { expiresIn: '1h' })],
  ['wrong algorithm', () => token(claims, { algorithm: 'HS384' })],
  ['unsigned', () => jwt.sign(claims, '', { algorithm: 'none' })],
  ['corrupt', () => 'aaa.bbb.ccc'],
  ['no expiry', () => jwt.sign(claims, secret)],
  ['no issue time', () => token(claims, { noTimestamp: true })],
  ['future issue time', () => token({ ...claims, iat: Math.floor(Date.now() / 1000) + 3600 })],
  ['too long lived', () => token(claims, { expiresIn: '8d' })],
  ['too old', () => token({ ...claims, iat: Math.floor(Date.now() / 1000) - 700000 })],
  ['string claims', () => jwt.sign('text', secret)],
  ...[undefined, null, '7', 0, -1, 1.2, Number.MAX_SAFE_INTEGER + 1].map(id => ['invalid id ' + id, () => token({ ...claims, id })]),
  ...[undefined, null, {}, 'invalid', 'a@localhost'].map(email => ['invalid email ' + email, () => token({ ...claims, email })])
])('rejects %s with the same response', (_, makeToken) => {
  req.headers.authorization = `Bearer ${makeToken()}`;
  expectDenied();
});
it.each([['POST', '/api/login'], ['POST', '/api/register'], ['POST', '/api/login?source=web'], ['GET', '/api/'], ['GET', '/api/reading'], ['GET', '/api/reading/12?view=full'], ['GET', '/api/writing/12']])('keeps %s %s public', (method, originalUrl) => {
  delete process.env.JWT_SECRET;
  Object.assign(req, { method, originalUrl });
  jwtauth(req, res, next);
  expect(next).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
});
it.each([['GET', '/api/login'], ['PUT', '/api/register'], ['POST', '/api/reading/12'], ['GET', '/api/reading/results/history'], ['GET', '/api/writing/submissions/history'], ['POST', '/api/login/extra']])('protects %s %s', (method, originalUrl) => {
  Object.assign(req, { method, originalUrl });
  expectDenied();
});
