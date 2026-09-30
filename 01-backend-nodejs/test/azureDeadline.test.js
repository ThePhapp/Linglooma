jest.mock('fs', () => ({ promises: { access: jest.fn(), readFile: jest.fn().mockResolvedValue(Buffer.from('wav')) } }));
jest.mock('microsoft-cognitiveservices-speech-sdk', () => ({
  SpeechConfig: { fromSubscription: jest.fn(() => ({})) },
  PronunciationAssessmentConfig: { fromJSON: jest.fn(() => ({ applyTo: jest.fn() })) },
  AudioConfig: { fromWavFileInput: jest.fn(() => ({})) },
  SpeechRecognizer: jest.fn(),
  ResultReason: { RecognizedSpeech: 1 },
}));

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { assessPronunciation } = require('../services/azurePronunciationService');

afterEach(() => jest.useRealTimers());

test('Azure recognition deadline rejects and closes recognizer once', async () => {
  jest.useFakeTimers();
  const recognizer = { recognizeOnceAsync: jest.fn(), close: jest.fn() };
  sdk.SpeechRecognizer.mockImplementation(() => recognizer);
  const pending = assessPronunciation('offline.wav', 'hello');
  await Promise.resolve();
  await Promise.resolve();
  jest.advanceTimersByTime(20000);
  await expect(pending).rejects.toThrow('Recognition deadline exceeded');
  expect(recognizer.close).toHaveBeenCalledTimes(1);
  // Late SDK callbacks cannot change the settled result.
  expect(() => recognizer.recognizeOnceAsync.mock.calls[0][0]({})).not.toThrow();
});
