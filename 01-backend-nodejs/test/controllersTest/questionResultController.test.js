jest.mock('../../models/questionResultModel');
jest.mock('../../models/lessonResultModel');

const {
  insertQuestionResultController,
  getQuestionResultOfLessonController
} = require('../../controllers/questionResultController');
const {
  insertQuestionResult,
  getQuestionResultOfLesson
} = require('../../models/questionResultModel');
const { isQuestionInOwnedLessonResult } = require('../../models/lessonResultModel');

describe('question result controllers', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { id: 7 },
      body: {
        lessonResultId: 10,
        questionId: 100,
        ieltsBand: 7,
        accuracy: 8,
        fluency: 7,
        completeness: 9,
        pronunciation: 6,
        feedback: 'Good work'
      },
      params: {
        studentId: '99',
        lessonResultId: '10'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('insertQuestionResultController', () => {
    it('requires an authenticated user', async () => {
      req.user = undefined;

      await insertQuestionResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(insertQuestionResult).not.toHaveBeenCalled();
    });

    it('requires the parent and question ids', async () => {
      delete req.body.lessonResultId;

      await insertQuestionResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(isQuestionInOwnedLessonResult).not.toHaveBeenCalled();
    });

    it('rejects a question outside the authenticated result', async () => {
      isQuestionInOwnedLessonResult.mockResolvedValue(false);

      await insertQuestionResultController(req, res);

      expect(isQuestionInOwnedLessonResult).toHaveBeenCalledWith(7, 10, 100);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(insertQuestionResult).not.toHaveBeenCalled();
    });

    it('inserts with the authenticated student id', async () => {
      isQuestionInOwnedLessonResult.mockResolvedValue(true);
      insertQuestionResult.mockResolvedValue();

      await insertQuestionResultController(req, res);

      expect(insertQuestionResult).toHaveBeenCalledWith(
        7, 10, 100, 7, 8, 7, 9, 6, 'Good work'
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getQuestionResultOfLessonController', () => {
    it('requires an authenticated user', async () => {
      req.user = undefined;

      await getQuestionResultOfLessonController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(getQuestionResultOfLesson).not.toHaveBeenCalled();
    });

    it('uses the token identity instead of the route student id', async () => {
      const result = { rows: [{ questionId: 100 }] };
      getQuestionResultOfLesson.mockResolvedValue(result);

      await getQuestionResultOfLessonController(req, res);

      expect(getQuestionResultOfLesson).toHaveBeenCalledWith(7, '10');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result.rows);
    });
  });
});
