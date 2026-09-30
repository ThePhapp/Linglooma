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
    jest.clearAllMocks();
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
    getTopIncorrectPhonemesWithAvgScore.mockResolvedValue([]);

    await getFeedbackSummaryController(req, res);

    expect(getTopIncorrectPhonemesWithAvgScore).toHaveBeenCalledWith(7, '10');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ isDemo: true }));
  });

  it('scopes lesson summaries to the authenticated user', async () => {
    getResultViews.mockResolvedValue([]);

    await getLessonsSummaryController(req, res);

    expect(getResultViews).toHaveBeenCalledWith(7);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
