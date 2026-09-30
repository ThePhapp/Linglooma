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
});
