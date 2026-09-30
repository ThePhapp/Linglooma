require('dotenv').config();
const jwt = require('jsonwebtoken');

function normalizeEmail(value) {
  if (typeof value !== 'string' || value.length > 320) return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,63}$/.test(email)) return null;
  const [local, domain] = email.split('@');
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  if (domain.split('.').some(label => !label || label.length > 63 || label.startsWith('-') || label.endsWith('-'))) return null;
  return email;
}

function jwtauth(req, res, next) {
  const path = typeof req.originalUrl === 'string' ? req.originalUrl.split('?')[0] : '';
  const isPublic = (req.method === 'POST' && ['/api/register', '/api/login'].includes(path)) ||
    (req.method === 'GET' && (path === '/api/' || /^\/api\/(reading|writing)(\/\d+)?$/.test(path)));
  if (isPublic) return next();
  const denied = () => res.status(401).json({ message: 'Invalid or expired authentication token' });
  // Never leave a stale identity attached when authentication fails.
  delete req.user;
  const authorization = req.headers?.authorization;
  if (typeof authorization !== 'string' || authorization.length > 8192 || !process.env.JWT_SECRET?.trim()) return denied();
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authorization);
  if (!match || match[0] !== authorization) return denied();
  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'], maxAge: '7d' });
    const email = normalizeEmail(decoded?.email);
    const now = Math.floor(Date.now() / 1000);
    if (!decoded || typeof decoded !== 'object' || !Number.isSafeInteger(decoded.id) || decoded.id <= 0 || !email ||
      !Number.isSafeInteger(decoded.exp) || !Number.isSafeInteger(decoded.iat) || decoded.iat > now ||
      decoded.exp <= now || decoded.exp <= decoded.iat || decoded.exp - decoded.iat > 604800) return denied();
    req.user = { id: decoded.id, email, name: decoded.name, phone: decoded.phone, gender: decoded.gender, nationality: decoded.nationality };
    return next();
  } catch {
    return denied();
  }
}

module.exports = jwtauth;
module.exports.normalizeEmail = normalizeEmail;
