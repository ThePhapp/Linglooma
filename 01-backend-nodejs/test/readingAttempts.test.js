// Offline only: importing the model cannot initialize a real pg pool.
jest.mock('../db', () => ({ connect: jest.fn(), query: jest.fn() }));
jest.mock('../models/learningIntelligenceModel', () => ({ recordMistakes: jest.fn() }));

const pool = require('../db');
const model = require('../models/readingModel');
const controller = require('../controllers/readingController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
const payload = () => [
    { questionId: 11, selectedOptionId: 'A', userAnswer: 'A', timeSpent: 12 },
    { questionId: 12, selectedOptionId: 0, userAnswer: '0' },
    { questionId: 13, userAnswer: 'false' }
];

let state;
let connections;
let failAt;
let rollbackFails;
let nextId;
let questions;

beforeEach(() => {
    jest.clearAllMocks();
    state = { attempts: [], answers: [] };
    connections = [];
    failAt = null;
    rollbackFails = false;
    nextId = 100;
    questions = [
        { id: 11, correct_answer: 'A', points: 2, question_type: 'multiple_choice', options: { A: 'One', B: 'Two' } },
        { id: 12, correct_answer: '0', points: 1, question_type: 'multiple_choice', options: [{ id: 0, text: 'Zero' }, { id: 1, label: 'One' }] },
        { id: 13, correct_answer: 'FALSE', points: 1, question_type: 'true_false_notgiven', options: null }
    ];
    // Each checked-out connection stages writes until COMMIT. A failure after a
    // successful answer insert must discard both the parent and staged answers.
    pool.connect.mockImplementation(async () => {
        const pending = { attempts: [], answers: [] };
        let inserts = 0;
        const connection = {
            release: jest.fn(),
            query: jest.fn(async (sql, params) => {
                const query = sql.replace(/\s+/g, ' ').trim();
                if (query === failAt) throw new Error(`Failed ${query}`);
                if (query === 'BEGIN') return { rows: [] };
                if (query === 'COMMIT') {
                    state.attempts.push(...pending.attempts);
                    state.answers.push(...pending.answers);
                    return { rows: [] };
                }
                if (query === 'ROLLBACK') {
                    if (rollbackFails) throw new Error('Rollback failed');
                    pending.attempts = [];
                    pending.answers = [];
                    return { rows: [] };
                }
                if (query.startsWith('SELECT id FROM reading_passages')) {
                    expect(params).toEqual([7]);
                    return { rows: failAt === 'missing passage' ? [] : [{ id: 7 }] };
                }
                if (query.includes('FROM reading_questions')) {
                    expect(query).toContain('WHERE passage_id = $1');
                    expect(params).toEqual([7]);
                    return { rows: questions };
                }
                if (query.startsWith('INSERT INTO reading_attempts')) {
                    if (failAt === 'attempt') throw new Error('Attempt insert failed');
                    const [user_id, passage_id, total_score, max_score, total_questions] = params;
                    const attempt = { id: nextId++, user_id, passage_id, total_score, max_score, total_questions };
                    pending.attempts.push(attempt);
                    return { rows: [{ id: attempt.id }] };
                }
                if (query.startsWith('INSERT INTO reading_answers')) {
                    inserts++;
                    if (failAt === `answer ${inserts}`) throw new Error('Answer insert failed');
                    const [attempt_id, user_id, passage_id, question_id, user_answer, is_correct, time_spent] = params;
                    pending.answers.push({ attempt_id, user_id, passage_id, question_id, user_answer, is_correct, time_spent });
                    return { rows: [] };
                }
                throw new Error(`Unexpected transaction query: ${query}`);
            })
        };
        connections.push(connection);
        return connection;
    });
    // Assert ownership/identity predicates as well as exercising their parameters.
    // This is a contract double, not a PostgreSQL execution engine.
    pool.query.mockImplementation(async (sql, params) => {
        const query = sql.replace(/\s+/g, ' ').trim();
        if (query.includes('FROM reading_attempts a')) {
            expect(query).toContain('WHERE a.user_id = $1');
            expect(query).toContain('ON ra.attempt_id = a.id');
            expect(query).toContain('GROUP BY a.id,');
            expect(query).toContain('ORDER BY a.submitted_at DESC, a.id DESC');
            if (params.length === 2) expect(query).toContain('AND a.passage_id = $2');
            return { rows: state.attempts.filter(a => a.user_id === params[0] &&
                (params.length === 1 || a.passage_id === params[1])).sort((a, b) => b.id - a.id) };
        }
        if (query.includes('FROM reading_attempts WHERE')) {
            expect(query).toContain('WHERE id = $1 AND user_id = $2');
            return { rows: state.attempts.filter(a => a.id === params[0] && a.user_id === params[1]) };
        }
        if (query.includes('FROM reading_answers ra')) {
            expect(query).toContain('WHERE ra.attempt_id = $1 AND ra.user_id = $2');
            return { rows: state.answers.filter(a => a.attempt_id === params[0] && a.user_id === params[1]) };
        }
        throw new Error(`Unexpected pool query: ${query}`);
    });
});

test('frontend aliases, numeric zero, weighted scoring and all answer writes share one transaction', async () => {
    const res = response();
    await controller.submitReading({ user: { id: 9 }, params: { id: '7' }, body: { answers: payload(), studentId: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ resultId: 100, score: 4, maxScore: 4, totalQuestions: 3, percentage: 100 })
    }));
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0].user_id).toBe(9);
    expect(state.answers.map(a => [a.attempt_id, a.user_answer, a.time_spent])).toEqual([
        [100, 'A', 12], [100, '0', 0], [100, 'FALSE', 0]
    ]);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
    expect(connections[0].query.mock.calls[0]).toEqual(['BEGIN']);
    expect(connections[0].query.mock.calls.at(-1)).toEqual(['COMMIT']);
    expect(connections[0].release).toHaveBeenCalledTimes(1);
});

test.each(['answer 2', 'attempt', 'COMMIT'])('rolls back the entire submission on %s failure', async failure => {
    failAt = failure;
    await expect(model.submitReading(9, 7, payload())).rejects.toThrow();
    expect(state).toEqual({ attempts: [], answers: [] });
    expect(connections[0].query.mock.calls.at(-1)).toEqual(['ROLLBACK']);
    expect(connections[0].release).toHaveBeenCalledTimes(1);
});

test('discards the connection if rollback fails and preserves the original error', async () => {
    failAt = 'answer 2';
    rollbackFails = true;
    await expect(model.submitReading(9, 7, payload())).rejects.toThrow('Answer insert failed');
    expect(connections[0].release).toHaveBeenCalledWith(expect.objectContaining({ message: 'Rollback failed' }));
});

test('releases the client if BEGIN fails', async () => {
    failAt = 'BEGIN';
    await expect(model.submitReading(9, 7, payload())).rejects.toThrow('Failed BEGIN');
    expect(connections[0].release).toHaveBeenCalledTimes(1);
    expect(state.attempts).toEqual([]);
});

test('concurrent retries have distinct identities, history entries and isolated details', async () => {
    const [first, second] = await Promise.all([
        model.submitReading(9, 7, payload()),
        model.submitReading(9, 7, [{ questionId: 11, selectedOptionId: 'B' }])
    ]);
    expect(first.resultId).not.toBe(second.resultId);
    expect(second).toMatchObject({ score: 0, maxScore: 4, totalQuestions: 3, percentage: 0 });
    expect(connections).toHaveLength(2);
    const history = await model.getStudentResults(9, '7');
    expect(history.rows.map(a => a.id)).toEqual([second.resultId, first.resultId]);
    expect((await model.getResultDetail(first.resultId, 9)).details).toHaveLength(3);
    expect((await model.getResultDetail(second.resultId, 9)).details).toEqual([
        expect.objectContaining({ attempt_id: second.resultId, user_answer: 'B' })
    ]);
    expect(await model.getResultDetail(7, 9)).toBeNull(); // Passage ID is not an attempt ID.
});

test('history and details enforce the authenticated owner and omit ungrouped legacy answers', async () => {
    const result = await model.submitReading(9, 7, payload());
    state.answers.push({ attempt_id: null, user_id: 10, passage_id: 7 });
    expect((await model.getStudentResults(10)).rows).toEqual([]);
    pool.query.mockClear();
    expect(await model.getResultDetail(result.resultId, 10)).toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1); // Do not read details for an unowned attempt.
    const res = response();
    await controller.getResultDetail({ user: { id: 10 }, params: { resultId: String(result.resultId) } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
});

test('partial submissions use the full denominator and accept either alias alone', async () => {
    const result = await model.submitReading(9, '7', [{ questionId: '11', userAnswer: ' a ' }]);
    expect(result).toMatchObject({ score: 2, maxScore: 4, totalQuestions: 3, percentage: 50 });
});

test.each([
    undefined, null, {}, [], [null], [[]], [true],
    [{ questionId: 11 }],
    [{ questionId: 0, userAnswer: 'A' }],
    [{ questionId: '11x', userAnswer: 'A' }],
    [{ questionId: [11], userAnswer: 'A' }],
    [{ questionId: 11.5, userAnswer: 'A' }],
    [{ questionId: 2147483648, userAnswer: 'A' }],
    [{ questionId: 11, userAnswer: '' }],
    [{ questionId: 11, userAnswer: '  ' }],
    [{ questionId: 11, userAnswer: null }],
    [{ questionId: 11, userAnswer: true }],
    [{ questionId: 11, userAnswer: {} }],
    [{ questionId: 11, userAnswer: [] }],
    [{ questionId: 11, selectedOptionId: NaN }],
    [{ questionId: 11, selectedOptionId: Infinity }],
    [{ questionId: 11, selectedOptionId: 'A', userAnswer: 'B' }],
    [{ questionId: 11, userAnswer: 'A', timeSpent: -1 }],
    [{ questionId: 11, userAnswer: 'A', timeSpent: 1.5 }],
    [{ questionId: 11, userAnswer: 'A', timeSpent: '12' }],
    [{ questionId: 11, userAnswer: 'A', timeSpent: null }],
    [{ questionId: 11, userAnswer: 'A', timeSpent: 2147483648 }],
    [{ questionId: 11, userAnswer: 'A' }, { questionId: '11', userAnswer: 'B' }]
].map(answers => [answers]))('invalid payload %# returns 400 before connecting', async answers => {
    const res = response();
    await controller.submitReading({ user: { id: 9 }, params: { id: '7' }, body: { answers } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.connect).not.toHaveBeenCalled();
});

test.each([
    { questionId: 999, userAnswer: 'A' },
    { questionId: 11, userAnswer: 'Z' },
    { questionId: 12, selectedOptionId: 2 },
    { questionId: 13, userAnswer: 'MAYBE' }
])('invalid question/option %# rolls back before any writes', async answer => {
    const res = response();
    await controller.submitReading({ user: { id: 9 }, params: { id: '7' }, body: { answers: [payload()[0], answer].slice(answer.questionId === 11 ? 1 : 0) } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(connections[0].query.mock.calls.some(([sql]) => sql.includes('INSERT INTO'))).toBe(false);
    expect(connections[0].query.mock.calls.at(-1)).toEqual(['ROLLBACK']);
    expect(connections[0].release).toHaveBeenCalledTimes(1);
});

test.each(['submitReading', 'getStudentResults', 'getResultDetail'])('%s requires authentication', async handler => {
    const res = response();
    await controller[handler]({ params: {}, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
});

test.each([
    ['submitReading', { params: { id: 'bad' }, body: { answers: payload() } }],
    ['submitReading', { params: { id: '7' } }],
    ['getStudentResults', { query: { passageId: 'bad' } }],
    ['getResultDetail', { params: { resultId: 'bad' } }]
])('%s rejects missing bodies or invalid resource IDs', async (handler, req) => {
    const res = response();
    await controller[handler]({ ...req, user: { id: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
});

test('missing passage returns 404; empty passage returns 400', async () => {
    failAt = 'missing passage';
    await expect(model.submitReading(9, 7, payload())).rejects.toMatchObject({ statusCode: 404 });
    failAt = null;
    questions = [];
    await expect(model.submitReading(9, 7, payload())).rejects.toMatchObject({ statusCode: 400 });
    expect(state.attempts).toEqual([]);
});

test('public question option IDs remain compatible and correct answers remain hidden', async () => {
    questions[1].options = ['Zero', 'One'];
    pool.query.mockResolvedValueOnce({ rows: [{ id: 7 }] }).mockResolvedValueOnce({ rows: questions });
    const data = await model.getPassageById(7);
    expect(data.questions.map(q => q.options.map(o => o.id))).toEqual([
        ['A', 'B'], [0, 1], ['TRUE', 'FALSE', 'NOT GIVEN']
    ]);
    expect(data.questions.every(q => !('correct_answer' in q))).toBe(true);
    expect(pool.query.mock.calls[1][0]).not.toContain('correct_answer');
    const result = await model.submitReading(9, 7, payload());
    expect(result.percentage).toBe(100);
});
