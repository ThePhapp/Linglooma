jest.mock('node-fetch', () => jest.fn());
jest.mock('../services/chatService', () => ({
  askGemini: jest.fn(), clearConversation: jest.fn(), getConversationLength: jest.fn(),
}));

const fetch = require('node-fetch');
const { postJsonWithDeadline } = require('../utils/providerRequest');
const { audioSize, MAX_AUDIO_BYTES } = require('../utils/fileUtils');
const { chatController } = require('../controllers/chatController');
const chatService = require('../services/chatService');

function response() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

test('provider deadline aborts a stalled request without a retry', async () => {
  jest.useFakeTimers();
  fetch.mockImplementation(() => new Promise(() => {}));
  const pending = postJsonWithDeadline(fetch, 'https://provider.test', { text: 'private' }, 25);
  jest.advanceTimersByTime(25);
  await expect(pending).rejects.toThrow('Provider deadline exceeded');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
});

test('audio size rejects malformed base64 and calculates decoded bytes', () => {
  expect(audioSize('%%%')).toBe(-1);
  expect(audioSize('aGVsbG8=')).toBe(5);
  expect(audioSize('A'.repeat(Math.ceil(MAX_AUDIO_BYTES / 3) * 4))).toBeGreaterThan(MAX_AUDIO_BYTES);
});

test('chat limits each account and does not send excess requests to provider', async () => {
  chatService.askGemini.mockResolvedValue('reply');
  chatService.getConversationLength.mockReturnValue(4);
  const req = { user: { id: 928371 }, body: { message: 'hello' } };
  for (let i = 0; i < 10; i++) await chatController(req, response());
  const res = response();
  await chatController(req, res);
  expect(res.status).toHaveBeenCalledWith(429);
  expect(chatService.askGemini).toHaveBeenCalledTimes(10);
});

test('chat rejects oversized text and missing account', async () => {
  const tooLong = response();
  await chatController({ user: { id: 928372 }, body: { message: 'x'.repeat(2001) } }, tooLong);
  expect(tooLong.status).toHaveBeenCalledWith(413);
  const missing = response();
  await chatController({ body: { message: 'hello' } }, missing);
  expect(missing.status).toHaveBeenCalledWith(401);
  expect(chatService.askGemini).not.toHaveBeenCalled();
});
