jest.mock('../../models/userModel');
jest.mock('bcrypt');

const { updateUserController, getAccountController } = require('../../controllers/userController');
const { findUserByEmail, findUserByName, updateUser } = require('../../models/userModel');
const bcrypt = require('bcrypt');
const jwtauth = require('../../middleware/jwtauth');
const userRouter = require('../../routes/userRoute');

describe('user routes', () => {
  it.each(['/update', '/account'])('protects %s with JWT middleware', (path) => {
    const routeLayer = userRouter.stack.find(layer => layer.route?.path === path);

    expect(routeLayer).toBeDefined();
    expect(routeLayer.route.stack[0].handle).toBe(jwtauth);
  });
});

describe('user controllers', () => {
  let req;
  let res;
  let logs;

  beforeEach(() => {
    req = {
      user: { id: 7, email: 'owner@example.com' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
    logs = ['log', 'error', 'warn', 'info', 'debug'].map(method => jest.spyOn(console, method).mockImplementation(() => {}));
  });

  afterEach(() => {
    for (const log of logs) expect(log).not.toHaveBeenCalled();
  });

  it('rejects an update without an authenticated identity', async () => {
    req.user = undefined;

    await updateUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(findUserByEmail).not.toHaveBeenCalled();
  });

  it('uses the authenticated email instead of a request-body email', async () => {
    req.body = {
      email: 'victim@example.com',
      username: 'owner',
      gender: 'F'
    };
    findUserByEmail.mockResolvedValue({
      rows: [{
        id: 7,
        email: 'owner@example.com',
        password: 'old-hash',
        username: 'owner',
        gender: 'M',
        nationality: 'VN',
        phonenumber: '123'
      }]
    });
    updateUser.mockResolvedValue();

    await updateUserController(req, res);

    expect(findUserByEmail).toHaveBeenCalledWith('owner@example.com');
    expect(updateUser).toHaveBeenCalledWith(
      'owner@example.com',
      'owner',
      'old-hash',
      'F',
      'VN',
      '123'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects a username owned by another account', async () => {
    req.body = { username: 'taken' };
    findUserByEmail.mockResolvedValue({
      rows: [{
        id: 7,
        email: 'owner@example.com',
        password: 'old-hash',
        username: 'owner'
      }]
    });
    findUserByName.mockResolvedValue({ rows: [{ email: 'other@example.com' }] });

    await updateUserController(req, res);

    expect(findUserByName).toHaveBeenCalledWith('taken');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('requires the current password before changing it', async () => {
    req.body = { password: 'new-password' };
    findUserByEmail.mockResolvedValue({
      rows: [{
        id: 7,
        email: 'owner@example.com',
        password: 'old-hash',
        username: 'owner'
      }]
    });

    await updateUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('rejects an invalid current password', async () => {
    req.body = { password: 'new-password', currentPassword: 'wrong-password' };
    findUserByEmail.mockResolvedValue({
      rows: [{
        id: 7,
        email: 'owner@example.com',
        password: 'old-hash',
        username: 'owner'
      }]
    });
    bcrypt.compare.mockResolvedValue(false);

    await updateUserController(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'old-hash');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('updates the authenticated account after password verification', async () => {
    req.body = {
      username: 'new-owner',
      password: 'new-password',
      currentPassword: 'correct-password',
      gender: 'F',
      nationality: 'US',
      phoneNumber: '999'
    };
    findUserByEmail.mockResolvedValue({
      rows: [{
        id: 7,
        email: 'owner@example.com',
        password: 'old-hash',
        username: 'owner',
        gender: 'M',
        nationality: 'VN',
        phonenumber: '123'
      }]
    });
    findUserByName.mockResolvedValue({ rows: [] });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');
    updateUser.mockResolvedValue();

    await updateUserController(req, res);

    expect(updateUser).toHaveBeenCalledWith(
      'owner@example.com',
      'new-owner',
      'new-hash',
      'F',
      'US',
      '999'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns a generic error when persistence fails', async () => {
    findUserByEmail.mockRejectedValue(new Error('DB error'));

    await updateUserController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating data' });
  });

  it('returns only the authenticated account payload', async () => {
    await getAccountController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.user);
  });

  it.each([undefined, null, [], false, 1, 'text'])('rejects malformed account body %p', async body => {
    req.body = body;
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(findUserByEmail).not.toHaveBeenCalled();
  });

  const invalidFields = [
    ...['username', 'gender', 'nationality', 'phoneNumber', 'phonenumber', 'password', 'currentPassword'].flatMap(field =>
      [null, 1, false, {}, []].map(value => [field, value])),
    ['username', 'x'.repeat(101)], ['username', 'user\nname'],
    ['gender', 'x'.repeat(51)], ['nationality', 'x'.repeat(51)],
    ['phoneNumber', '1'.repeat(12)], ['phonenumber', '1'.repeat(12)],
    ['phoneNumber', '123abc'], ['phonenumber', '+12345678901'],
    ['password', '1234567'], ['password', 'x'.repeat(129)],
    ['currentPassword', 'x'.repeat(129)]
  ];
  it.each(invalidFields)('rejects invalid %s %p before database work', async (field, value) => {
    req.body = { [field]: value };
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it.each(['12345678', '  secret  ', 'x'.repeat(128), '🔐'.repeat(128)])('uses the registration password policy for %p', async password => {
    req.body = { password, currentPassword: ' legacy ' };
    findUserByEmail.mockResolvedValue({ rows: [{ id: 7, email: req.user.email, password: 'old-hash' }] });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');
    await updateUserController(req, res);
    expect(bcrypt.compare).toHaveBeenCalledWith(' legacy ', 'old-hash');
    expect(bcrypt.hash).toHaveBeenCalledWith(Buffer.byteLength(password) > 72 ? expect.any(String) : password, 10);
    expect(updateUser.mock.calls[0][2]).toBe(Buffer.byteLength(password) > 72 ? 'bcrypt-sha256:new-hash' : 'new-hash');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('preserves settings form empty fields without changing the password', async () => {
    req.body = { username: '', gender: '', nationality: '', phonenumber: '', password: '', currentPassword: '' };
    findUserByEmail.mockResolvedValue({ rows: [{ id: 7, email: req.user.email, username: 'owner', password: 'old-hash', gender: 'F', nationality: 'VN', phonenumber: '123' }] });
    await updateUserController(req, res);
    expect(updateUser).toHaveBeenCalledWith(req.user.email, 'owner', 'old-hash', 'F', 'VN', '123');
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it.each(['phoneNumber', 'phonenumber'])('accepts bounded profile values and %s', async field => {
    req.body = { username: 'x'.repeat(100), gender: 'x'.repeat(50), nationality: 'x'.repeat(50), [field]: '12345678901' };
    findUserByEmail.mockResolvedValue({ rows: [{ id: 7, email: req.user.email, password: 'old-hash' }] });
    findUserByName.mockResolvedValue({ rows: [] });
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(updateUser).toHaveBeenCalledWith(req.user.email, req.body.username, 'old-hash', req.body.gender, req.body.nationality, '12345678901');
  });

  it('rejects conflicting phone aliases', async () => {
    req.body = { phoneNumber: '123', phonenumber: '456' };
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it.each([undefined, {}, { email: 'bad', id: 7 }, { email: 'owner@example.com', id: '7' }])('rejects invalid authenticated identity %p', async user => {
    req.user = user;
    await updateUserController(req, res);
    await getAccountController(req, res);
    expect(res.status.mock.calls).toEqual([[401], [401]]);
    expect(findUserByEmail).not.toHaveBeenCalled();
  });

  it.each([8, undefined, '7'])('rejects an authenticated ID/email mismatch (%p)', async id => {
    findUserByEmail.mockResolvedValue({ rows: [{ id, email: req.user.email }] });
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('normalizes authenticated email and ignores client identity', async () => {
    req.user.email = ' OWNER@Example.com ';
    req.body = { id: 8, email: { malicious: true }, username: 'new-owner' };
    findUserByEmail.mockResolvedValue({ rows: [{ id: 7, email: 'owner@example.com', password: 'old-hash' }] });
    findUserByName.mockResolvedValue({ rows: [{ id: 7, email: 'OWNER@example.com' }] });
    await updateUserController(req, res);
    expect(findUserByEmail).toHaveBeenCalledWith('owner@example.com');
    expect(updateUser.mock.calls[0][0]).toBe('owner@example.com');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles deleted accounts', async () => {
    findUserByEmail.mockResolvedValue({ rows: [] });
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('handles a concurrent duplicate username generically', async () => {
    findUserByEmail.mockResolvedValue({ rows: [{ id: 7, email: req.user.email }] });
    updateUser.mockRejectedValue(Object.assign(new Error('secret DB email'), { code: '23505' }));
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username already existed' });
  });

  it.each(['compare', 'hash', 'update', 'username'])('hides %s error details', async failure => {
    req.body = { username: 'new-owner', password: 'new-password', currentPassword: 'current-password' };
    findUserByEmail.mockResolvedValue({ rows: [{ id: 7, email: req.user.email, password: 'old-hash' }] });
    findUserByName.mockResolvedValue({ rows: [] });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');
    const target = { compare: bcrypt.compare, hash: bcrypt.hash, update: updateUser, username: findUserByName }[failure];
    target.mockRejectedValue(new Error('email password token provider DB secret'));
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating data' });
  });
});
