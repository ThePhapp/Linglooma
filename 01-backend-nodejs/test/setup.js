// Unit tests must never depend on a developer's .env, database or AI account.
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../db', () => {
  const unexpected = () => {
    mockDbAttempts.push('Unexpected database access');
    throw new Error('Mock the database explicitly in this test');
  };
  return { query: unexpected, connect: unexpected, end: unexpected };
});

process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';
process.env.GEMINI_API_KEY = 'offline-test-key';
process.env.AZURE_SPEECH_KEY = 'offline-test-key';
process.env.AZURE_SPEECH_REGION = 'offline-test-region';
process.env.JWT_SECRET = 'offline-test-secret';

const net = require('net');
const originalConnect = net.Socket.prototype.connect;
const originalFetch = global.fetch;
const mockDbAttempts = [];
let networkAttempts = [];
function blockNetwork() {
  const blocked = () => {
    networkAttempts.push('Unexpected network access; mock the provider or database');
    throw new Error(networkAttempts.at(-1));
  };
  // Plain guards survive tests that call resetAllMocks themselves.
  net.Socket.prototype.connect = blocked;
  if (typeof originalFetch === 'function') global.fetch = blocked;
}

// Cover import-time side effects too.
blockNetwork();
beforeEach(blockNetwork);
afterEach(() => {
  const attempts = networkAttempts;
  networkAttempts = [];
  jest.useRealTimers();
  jest.restoreAllMocks();
  // A production catch must not turn an accidental network request into a pass.
  expect(attempts).toEqual([]);
  expect(mockDbAttempts.splice(0)).toEqual([]);
});
afterAll(() => {
  net.Socket.prototype.connect = originalConnect;
  global.fetch = originalFetch;
});
