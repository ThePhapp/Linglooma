jest.mock('node-fetch', () => jest.fn());
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../db', () => ({ query: jest.fn(), connect: jest.fn() }));
jest.mock('../models/learningIntelligenceModel', () => ({ recordMistakes: jest.fn() }));
jest.mock('../services/geminiWritingService', () => {
  const service = jest.requireActual('../services/geminiWritingService');
  return { ...service, evaluateWritingWithGemini: jest.fn(service.evaluateWritingWithGemini) };
});

const originalApiKey = process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY = 'offline-test-key';
const fetch = require('node-fetch');
const pool = require('../db');
const service = require('../services/geminiWritingService');
const actualService = jest.requireActual('../services/geminiWritingService');
const model = require('../models/writingModel');
const controller = require('../controllers/writingController');

const evaluationArgs = {
  taskType: 'Task 2', promptText: 'Discuss education.', essayText: 'An example essay.', wordCount: 3
};
const submissionArgs = { promptId: 10, studentId: 20, essayText: evaluationArgs.essayText };
const submission = { id: 30, submitted_at: '2026-09-30T00:00:00.000Z' };
const unavailable = {
  name: 'WritingEvaluationError',
  code: 'WRITING_EVALUATION_UNAVAILABLE',
  message: 'Writing evaluation is temporarily unavailable. Please try again.'
};

function validEvaluation() {
  return {
    scores: {
      task_achievement: 6, coherence_cohesion: 6.5, lexical_resource: 7,
      grammar_accuracy: 6.5, overall_band: 6.5
    },
    overall_feedback: 'A clear response.',
    strengths: 'Clear argument.',
    weaknesses: 'Some repetition.',
    grammar_errors: [{ error: 'They is', correction: 'They are', explanation: 'Plural subject.' }],
    vocabulary_suggestions: [{ word: 'good', suggestion: 'effective', context: 'An effective method.' }],
    structure_feedback: 'Use a concluding paragraph.',
    improvement_tips: 'Vary sentence structure.'
  };
}

function respondWith(text, candidateFields = {}) {
  fetch.mockResolvedValue({
    ok: true, status: 200,
    json: jest.fn().mockResolvedValue({
      candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP', ...candidateFields }]
    })
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  require('./helpers/expectedConsole')('log', [
    'Student 20 submitting essay for prompt 10', '🤖 Calling Gemini API for essay evaluation...',
    'Task Type:', 'Word Count:', 'Essay length:', '✅ Got response from Gemini, length:',
    '📝 Parsing JSON response...', '✅ Essay evaluated successfully!', 'Overall band:',
  ]);
  require('./helpers/expectedConsole')('error', ['Failed to submit writing']);
  service.evaluateWritingWithGemini.mockImplementation(actualService.evaluateWritingWithGemini);
  respondWith(JSON.stringify(validEvaluation()));
});

afterAll(() => {
  jest.restoreAllMocks();
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;
});

describe('Gemini writing output', () => {
  test.each(['plain', 'json fence', 'bare fence', 'CRLF fence'])('accepts valid %s JSON', async format => {
    const evaluation = validEvaluation();
    const json = JSON.stringify(evaluation);
    const formats = {
      plain: json, 'json fence': `\`\`\`json\n${json}\n\`\`\``,
      'bare fence': `\`\`\`\n${json}\n\`\`\``, 'CRLF fence': `\`\`\`json\r\n${json}\r\n\`\`\``
    };
    respondWith(formats[format]);
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).resolves.toEqual(evaluation);
  });

  test.each(['{broken provider detail', '', 'null', '[]', '{}', '```json\n{}', 'Here is the result: {}'])(
    'rejects malformed or incomplete output: %s', async text => {
      respondWith(text);
      await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
    }
  );

  describe.each(Object.keys(validEvaluation().scores))('%s', field => {
    test.each([-0.5, 9.5, '6.5', null, true, undefined])('rejects invalid score %s', async score => {
      const evaluation = validEvaluation();
      evaluation.scores[field] = score;
      respondWith(JSON.stringify(evaluation));
      await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
    });
  });

  test.each([0, 9])('accepts the inclusive score boundary %s and empty suggestion arrays', async score => {
    const evaluation = validEvaluation();
    Object.keys(evaluation.scores).forEach(field => { evaluation.scores[field] = score; });
    evaluation.grammar_errors = [];
    evaluation.vocabulary_suggestions = [];
    respondWith(JSON.stringify(evaluation));
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).resolves.toEqual(evaluation);
  });

  test.each([NaN, Infinity, -Infinity])('rejects non-finite numbers: %s', score => {
    const evaluation = validEvaluation();
    evaluation.scores.overall_band = score;
    expect(() => service.validateWritingEvaluation(evaluation)).toThrow(service.WritingEvaluationError);
  });

  test.each(Object.keys(validEvaluation()))('requires the %s field', async field => {
    const evaluation = validEvaluation();
    delete evaluation[field];
    respondWith(JSON.stringify(evaluation));
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
  });

  test.each([
    ['overall_feedback', '  '], ['strengths', []], ['weaknesses', null],
    ['structure_feedback', 12], ['improvement_tips', ''],
    ['grammar_errors', {}], ['grammar_errors', [null]],
    ['grammar_errors', [{ error: 'bad', correction: 'good' }]],
    ['vocabulary_suggestions', 'none'],
    ['vocabulary_suggestions', [{ word: 'good', suggestion: 'effective', context: '' }]]
  ])('rejects invalid %s content (%j)', async (field, value) => {
    const evaluation = validEvaluation();
    evaluation[field] = value;
    respondWith(JSON.stringify(evaluation));
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
  });

  test('normalizes network errors without returning fallback scores or provider details', async () => {
    fetch.mockRejectedValue(new Error('secret provider URL/key'));
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
  });

  test('rejects unsuccessful HTTP status even with valid evaluation content', async () => {
    const json = jest.fn().mockResolvedValue({ secret: 'provider detail' });
    fetch.mockResolvedValue({ ok: false, status: 503, json });
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
    expect(json).not.toHaveBeenCalled();
  });

  test('normalizes failures parsing the provider response body', async () => {
    fetch.mockResolvedValue({ ok: true, json: jest.fn().mockRejectedValue(new Error('secret body')) });
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
  });

  test.each([{}, { error: { message: 'secret' } }, { candidates: [] }])(
    'rejects missing provider content (%j)', async body => {
      fetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue(body) });
      await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
    }
  );

  test.each(['MAX_TOKENS', 'SAFETY'])('rejects incomplete/blocked generation: %s', async finishReason => {
    respondWith(JSON.stringify(validEvaluation()), { finishReason });
    await expect(service.evaluateWritingWithGemini(evaluationArgs)).rejects.toMatchObject(unavailable);
  });
});

describe('writing submission persistence and controller', () => {
  let req, res;
  beforeEach(() => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ task_type: 'Task 2', prompt: 'Discuss education.' }] })
      .mockResolvedValueOnce({ rows: [submission] })
      .mockResolvedValueOnce({ rows: [{ id: submission.id }] });
    req = { params: { id: 10 }, body: { essayText: submissionArgs.essayText }, user: { id: 20 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('persists an incomplete submission before AI and completes it only after valid evaluation', async () => {
    let resolveEvaluation;
    const pendingEvaluation = new Promise(resolve => { resolveEvaluation = resolve; });
    let signalStarted;
    const started = new Promise(resolve => { signalStarted = resolve; });
    service.evaluateWritingWithGemini.mockImplementation(() => {
      signalStarted();
      return pendingEvaluation;
    });
    const pendingSubmission = model.submitWriting(submissionArgs);
    await started;
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query.mock.calls[1]).toEqual([
      expect.stringMatching(/INSERT INTO writing_submissions[\s\S]*is_completed[\s\S]*VALUES \(\$1, \$2, \$3, \$4, false\)/),
      [10, 20, submissionArgs.essayText, 3]
    ]);
    const evaluation = validEvaluation();
    resolveEvaluation(evaluation);
    const { scores, ...feedback } = evaluation;
    await expect(pendingSubmission).resolves.toEqual({
      submissionId: 30, submittedAt: submission.submitted_at, wordCount: 3, scores, feedback
    });
    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(pool.query.mock.calls[2]).toEqual([
      expect.stringMatching(/UPDATE writing_submissions[\s\S]*is_completed = true/),
      [6.5, 6, 6.5, 7, 6.5, evaluation.overall_feedback, evaluation.strengths,
        evaluation.structure_feedback, JSON.stringify(evaluation.vocabulary_suggestions),
        JSON.stringify(evaluation.grammar_errors), evaluation.improvement_tips, service.PROMPT_VERSION, 30]
    ]);
  });

  test('validates at the persistence boundary even if the evaluator returns invalid data', async () => {
    const evaluation = validEvaluation();
    evaluation.scores.grammar_accuracy = 12;
    service.evaluateWritingWithGemini.mockResolvedValue(evaluation);
    await expect(model.submitWriting(submissionArgs)).rejects.toMatchObject({ ...unavailable, submissionId: 30 });
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test.each(['network', 'HTTP', 'body parse', 'malformed output', 'invalid score'])(
    'returns a stable retryable response on %s failure and leaves the saved submission incomplete', async failure => {
      if (failure === 'network') fetch.mockRejectedValue(new Error('secret provider detail'));
      if (failure === 'HTTP') fetch.mockResolvedValue({ ok: false, status: 403 });
      if (failure === 'body parse') fetch.mockResolvedValue({ ok: true, json: jest.fn().mockRejectedValue(new Error('secret')) });
      if (failure === 'malformed output') respondWith('{secret provider detail');
      if (failure === 'invalid score') {
        const evaluation = validEvaluation();
        evaluation.scores.overall_band = -1;
        respondWith(JSON.stringify(evaluation));
      }
      await controller.submitWriting(req, res);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false, code: 'WRITING_EVALUATION_UNAVAILABLE',
        message: 'Essay saved, but evaluation is temporarily unavailable. Please try again.',
        retryable: true, submissionId: 30
      });
      expect(pool.connect).not.toHaveBeenCalled();
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query.mock.calls[1][0]).toMatch(/is_completed[\s\S]*false/);
    }
  );

  test('preserves the successful controller response', async () => {
    await controller.submitWriting(req, res);
    const { scores, ...feedback } = validEvaluation();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true, message: 'Essay submitted and evaluated successfully',
      data: { submissionId: 30, submittedAt: submission.submitted_at, wordCount: 3, scores, feedback }
    });
  });

  test('does not call AI when saving the submission fails', async () => {
    pool.query.mockReset()
      .mockResolvedValueOnce({ rows: [{ task_type: 'Task 2', prompt: 'Discuss education.' }] })
      .mockRejectedValueOnce(new Error('database insert failed'));
    await expect(model.submitWriting(submissionArgs)).rejects.toThrow('database insert failed');
    expect(service.evaluateWritingWithGemini).not.toHaveBeenCalled();
  });

  test('retries evaluation against the existing pending submission without inserting a duplicate', async () => {
    pool.query.mockReset()
      .mockResolvedValueOnce({ rows: [{
        id: 30, submitted_at: submission.submitted_at, essay_text: evaluationArgs.essayText,
        word_count: 3, is_completed: false, task_type: 'Task 2', prompt: 'Discuss education.'
      }] })
      .mockResolvedValueOnce({ rows: [{ id: 30 }] });

    const result = await model.retryWritingEvaluation(30, 20);

    expect(result).toMatchObject({ submissionId: 30, scores: { overall_band: 6.5 } });
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query.mock.calls[0]).toEqual([expect.stringMatching(/WHERE ws.id = \$1 AND ws.user_id = \$2/), [30, 20]]);
    expect(pool.query.mock.calls.some(([sql]) => /INSERT INTO writing_submissions/.test(sql))).toBe(false);
    expect(pool.query.mock.calls[1][0]).toMatch(/WHERE id = \$13 AND is_completed = false/);
  });

  test('does not reevaluate completed or unowned submissions', async () => {
    pool.query.mockReset().mockResolvedValueOnce({ rows: [] });
    await expect(model.retryWritingEvaluation(30, 99)).resolves.toBeNull();
    expect(service.evaluateWritingWithGemini).not.toHaveBeenCalled();

    pool.query.mockReset().mockResolvedValueOnce({ rows: [{ id: 30, is_completed: true }] });
    await expect(model.retryWritingEvaluation(30, 20)).rejects.toMatchObject({ statusCode: 409 });
    expect(service.evaluateWritingWithGemini).not.toHaveBeenCalled();
  });

  test('rejects invalid writing IDs and oversized essays before persistence', async () => {
    req.params.id = '1;DROP';
    await controller.submitWriting(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.query).not.toHaveBeenCalled();

    req.params.id = '10';
    req.body.essayText = 'x'.repeat(12001);
    await controller.submitWriting(req, res);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test.each(['update failed', 'submission disappeared'])('does not report success when %s', async failure => {
    pool.query.mockReset()
      .mockResolvedValueOnce({ rows: [{ task_type: 'Task 2', prompt: 'Discuss education.' }] })
      .mockResolvedValueOnce({ rows: [submission] });
    if (failure === 'update failed') pool.query.mockRejectedValueOnce(new Error('private database detail'));
    else pool.query.mockResolvedValueOnce({ rows: [] });
    await controller.submitWriting(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to submit essay' });
  });
});
