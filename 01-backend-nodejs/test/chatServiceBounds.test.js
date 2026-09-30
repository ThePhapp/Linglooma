jest.mock('node-fetch', () => jest.fn());

const fetch = require('node-fetch');
const { askGemini, getConversationLength, clearConversation } = require('../services/chatService');
const originalKey = process.env.GEMINI_API_KEY;

beforeAll(() => { process.env.GEMINI_API_KEY = 'offline-test-key'; });
afterAll(() => {
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
});
afterEach(() => {
  jest.useRealTimers();
  clearConversation('account-a');
  clearConversation('account-b');
  fetch.mockReset();
});

test('chat keeps accounts separate and caps retained history', async () => {
  fetch.mockImplementation(async () => ({
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: 'reply' }] } }] }),
  }));
  for (let i = 0; i < 15; i++) await askGemini(`message ${i}`, 'account-a');
  await askGemini('private message', 'account-b');
  expect(getConversationLength('account-a')).toBeLessThanOrEqual(20);
  expect(getConversationLength('account-b')).toBe(4);
  const lastBody = JSON.parse(fetch.mock.calls.at(-1)[1].body);
  expect(JSON.stringify(lastBody)).not.toContain('message 14');
});

test('idle chat sessions expire', async () => {
  jest.useFakeTimers();
  fetch.mockResolvedValue({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'reply' }] } }] }) });
  await askGemini('hello', 'account-a');
  expect(getConversationLength('account-a')).toBe(4);
  jest.advanceTimersByTime(30 * 60 * 1000);
  expect(getConversationLength('account-a')).toBe(0);
});

test('provider failures leave no user message in retained history', async () => {
  fetch.mockRejectedValue(new Error('private provider body'));
  await expect(askGemini('sensitive text', 'account-a')).rejects.toThrow('Chat provider unavailable');
  expect(getConversationLength('account-a')).toBe(2);
});
