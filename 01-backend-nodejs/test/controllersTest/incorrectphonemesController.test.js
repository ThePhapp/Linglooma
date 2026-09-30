jest.mock('../../models/incorrectphonemesModel');
jest.mock('../../models/lessonResultModel');
jest.mock('../../models/questionResultModel');

const {
  insertIncorrectPhonemeController,
  getIncorrectPhonemesOfLessonController,
  getFeedbackSummaryController,
  getLessonsSummaryController
} = require('../../controllers/incorrectphonemesController');
const {
  insertOrUpdateIncorrectPhonemes,
  getIncorrectPhonemesOfLesson,
  getTopIncorrectPhonemesWithAvgScore,
  getResultViews
} = require('../../models/incorrectphonemesModel');
const { ownsLessonResult } = require('../../models/lessonResultModel');
const { isOwnedQuestionResult } = require('../../models/questionResultModel');

describe('incorrect phoneme controllers', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    require('../helpers/expectedConsole')('log', ['📝 Inserting incorrect phonemes', '✅ Incorrect phonemes inserted']);
    req = {
      user: { id: 7 },
      body: {
        phoneme: { '/th/': 2 },
        questionResultId: 20,
        lessonResultId: 10,
        questionId: 3
      },
      params: { studentId: '99', lessonResultId: '10' },
      query: { lessonResultId: '10' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('rejects phonemes for a question result the user does not own', async () => {
    isOwnedQuestionResult.mockResolvedValue(false);

    await insertIncorrectPhonemeController(req, res);

    expect(isOwnedQuestionResult).toHaveBeenCalledWith(7, 20, 10, 3);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(insertOrUpdateIncorrectPhonemes).not.toHaveBeenCalled();
  });

  it('persists phonemes only after ownership validation', async () => {
    isOwnedQuestionResult.mockResolvedValue(true);

    await insertIncorrectPhonemeController(req, res);

    expect(insertOrUpdateIncorrectPhonemes).toHaveBeenCalledWith(
      { '/th/': 2 }, 20, 10, 3, 7
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('uses the token identity when reading phonemes', async () => {
    getIncorrectPhonemesOfLesson.mockResolvedValue([{ phoneme: '/th/' }]);

    await getIncorrectPhonemesOfLessonController(req, res);

    expect(getIncorrectPhonemesOfLesson).toHaveBeenCalledWith(7, '10');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects feedback for a lesson result the user does not own', async () => {
    ownsLessonResult.mockResolvedValue(false);

    await getFeedbackSummaryController(req, res);

    expect(ownsLessonResult).toHaveBeenCalledWith(7, '10');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(getTopIncorrectPhonemesWithAvgScore).not.toHaveBeenCalled();
  });

  it('scopes feedback queries to the authenticated user', async () => {
    ownsLessonResult.mockResolvedValue(true);
    req.query.studentId = '99';
    getTopIncorrectPhonemesWithAvgScore.mockResolvedValue([{
      lesson_name: 'Actual lesson',
      lesson_type: 'Speaking',
      finishedtime: '2026-09-30T10:00:00Z',
      lesson_score: null,
      question_count: '4',
      questionid: null,
      phoneme: null,
    }]);

    await getFeedbackSummaryController(req, res);

    expect(ownsLessonResult).toHaveBeenCalledWith(7, '10');
    expect(getTopIncorrectPhonemesWithAvgScore).toHaveBeenCalledWith(7, '10');
    expect(res.json).toHaveBeenCalledWith({
      lessonInfo: {
        lessonName: 'Actual lesson',
        lessonType: 'Speaking',
        finishedTime: '2026-09-30T10:00:00Z',
        lessonScore: null,
        questionCount: '4',
      },
      questions: [],
    });
  });

  it('returns real scores and feedback for a question with no phoneme errors', async () => {
    ownsLessonResult.mockResolvedValue(true);
    getTopIncorrectPhonemesWithAvgScore.mockResolvedValue([{
      lesson_name: 'Actual lesson', lesson_type: 'Speaking',
      finishedtime: null, lesson_score: 0, question_count: '1',
      questionid: 3, ieltsband: 0, accuracy: 0, fluency: 81,
      completeness: 100, pronunciation: 92,
      avg_feedback: 'Saved assessment feedback',
      phoneme: null, total_incorrect: null,
    }]);

    await getFeedbackSummaryController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      lessonInfo: {
        lessonName: 'Actual lesson', lessonType: 'Speaking',
        finishedTime: null, lessonScore: 0, questionCount: '1',
      },
      questions: [{
        questionId: 3,
        averageScores: {
          ieltsBand: 0, accuracy: 0, fluency: 81,
          completeness: 100, pronunciation: 92,
        },
        feedback: 'Saved assessment feedback',
        topIncorrectPhonemes: [],
      }],
    });
  });

  it('keeps questions with and without errors and groups only real phonemes', async () => {
    ownsLessonResult.mockResolvedValue(true);
    const metadata = { lesson_name: '', lesson_score: null, question_count: '2' };
    getTopIncorrectPhonemesWithAvgScore.mockResolvedValue([
      { ...metadata, questionid: 3, phoneme: '/th/', total_incorrect: '3', ieltsband: 6 },
      { ...metadata, questionid: 3, phoneme: '/r/', total_incorrect: '1', ieltsband: 6 },
      { ...metadata, questionid: 4, phoneme: null, ieltsband: null, avg_feedback: null },
    ]);

    await getFeedbackSummaryController(req, res);

    const response = res.json.mock.calls[0][0];
    expect(Object.keys(response).sort()).toEqual(['lessonInfo', 'questions']);
    expect(response.lessonInfo.lessonName).toBe('');
    expect(response.questions).toHaveLength(2);
    expect(response.questions[0].topIncorrectPhonemes).toEqual([
      { phoneme: '/th/', count: '3' }, { phoneme: '/r/', count: '1' },
    ]);
    expect(response.questions[1]).toEqual({
      questionId: 4,
      averageScores: {
        ieltsBand: null, accuracy: null, fluency: null,
        completeness: null, pronunciation: null,
      },
      feedback: '', topIncorrectPhonemes: [],
    });
  });

  it('returns 404 if the owned result disappears before the summary query', async () => {
    ownsLessonResult.mockResolvedValue(true);
    getTopIncorrectPhonemesWithAvgScore.mockResolvedValue([]);

    await getFeedbackSummaryController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Lesson result not found' });
  });

  it('requires authentication before checking ownership or querying feedback', async () => {
    req.user = undefined;

    await getFeedbackSummaryController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(ownsLessonResult).not.toHaveBeenCalled();
    expect(getTopIncorrectPhonemesWithAvgScore).not.toHaveBeenCalled();
  });

  it.each([undefined, '', '0', '-1', '1.5', 'abc', '1e2', '2147483648', ['10'], {}])(
    'rejects malformed lesson result ID %p without querying the database',
    async lessonResultId => {
      req.query.lessonResultId = lessonResultId;

      await getFeedbackSummaryController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(ownsLessonResult).not.toHaveBeenCalled();
      expect(getTopIncorrectPhonemesWithAvgScore).not.toHaveBeenCalled();
    }
  );

  it('reports query failure without inventing feedback', async () => {
    ownsLessonResult.mockResolvedValue(true);
    getTopIncorrectPhonemesWithAvgScore.mockRejectedValue(new Error('database unavailable'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await getFeedbackSummaryController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to get feedback summary' });
    } finally {
      log.mockRestore();
    }
  });

  it('scopes lesson summaries to the authenticated user', async () => {
    getResultViews.mockResolvedValue([]);

    await getLessonsSummaryController(req, res);

    expect(getResultViews).toHaveBeenCalledWith(7);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
