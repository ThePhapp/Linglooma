require('dotenv').config();
const bcrypt = require('bcrypt');
const { createHash } = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { normalizeEmail } = require('../middleware/jwtauth');

const LONG_HASH_PREFIX = 'bcrypt-sha256:';
// A fixed valid hash makes unknown-account logins do the same bcrypt work.
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const isBody = body => body !== null && typeof body === 'object' && !Array.isArray(body);
const isValidPassword = password => typeof password === 'string' &&
  password.length <= 256 && [...password].length >= 8 && [...password].length <= 128;
const passwordDigest = password => createHash('sha256').update(password, 'utf8').digest('base64');

async function hashPassword(password) {
  // bcrypt only uses 72 bytes. Tag longer passwords so every character matters.
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return LONG_HASH_PREFIX + await bcrypt.hash(passwordDigest(password), 10);
  }
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  if (typeof hash !== 'string' || !hash) return bcrypt.compare(password, DUMMY_HASH).then(() => false);
  return hash.startsWith(LONG_HASH_PREFIX)
    ? bcrypt.compare(passwordDigest(password), hash.slice(LONG_HASH_PREFIX.length))
    : bcrypt.compare(password, hash);
}

function tokenLifetime() {
  const value = process.env.JWT_EXPIRE || '';
  const match = /^(\d+)\s*(s|m|h|d)?$/i.exec(value.trim());
  const seconds = match ? Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2]?.toLowerCase() || 's']) : 0;
  return Number.isSafeInteger(seconds) && seconds > 0 && seconds <= 604800 ? seconds : 3600;
}

exports.register = async (req, res) => {
  const email = isBody(req.body) && normalizeEmail(req.body.email);
  if (!email || !isValidPassword(req.body.password)) {
    return res.status(400).json({ message: 'A valid email and an 8–128 character password are required' });
  }
  try {
    const existing = await User.findUserByEmail(email);
    if (existing.rows.length) return res.status(400).json({ msg: 'Email already exists' });
    await User.insertUser(email, await hashPassword(req.body.password));
    return res.json({ msg: 'Register successfully', success: true });
  } catch (err) {
    // A concurrent registration can win after the initial lookup.
    if (err?.code === '23505') return res.status(400).json({ msg: 'Email already exists' });
    return res.status(500).json({ msg: 'Register failed', success: false });
  }
};

exports.login = async (req, res) => {
  const email = isBody(req.body) && normalizeEmail(req.body.email);
  const password = isBody(req.body) && req.body.password;
  const denied = () => res.status(401).json({ msg: 'Email or password is wrong', success: false });
  // Legacy accounts may have shorter passwords; only new passwords use the new minimum.
  if (!email || typeof password !== 'string' || !password.length || password.length > 256 || [...password].length > 128) return denied();
  try {
    if (!process.env.JWT_SECRET?.trim()) throw new Error('Authentication unavailable');
    const result = await User.findUserByEmail(email);
    const user = result.rows[0];
    const matches = await comparePassword(password, user?.password);
    if (!user || !matches) return denied();
    const identityEmail = normalizeEmail(user.email);
    if (!Number.isSafeInteger(user.id) || user.id <= 0 || !identityEmail) throw new Error('Invalid identity');
    const payload = {
      id: user.id, email: identityEmail, name: user.username,
      phone: user.phonenumber, gender: user.gender, nationality: user.nationality
    };
    const access_token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: tokenLifetime() });
    const { id, ...profile } = payload;
    return res.status(200).json({ access_token, msg: 'Login successful', success: true, user: profile });
  } catch {
    return res.status(500).json({ msg: 'Login failed', success: false });
  }
};

// Shared by account updates so password policy and hash handling cannot drift.
exports.isBody = isBody;
exports.isValidPassword = isValidPassword;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
