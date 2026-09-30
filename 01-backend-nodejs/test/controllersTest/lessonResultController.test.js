jest.mock('../../models/lessonResultModel');

const {
  insertLessonResultController,
  getLessonResultController,
  getRecentlyLessonResultController
} = require('../../controllers/lessonResultController');
const {
  insertLessonResult,
  getLessonResult,
  getRecentlyLessonResult
} = require('../../models/lessonResultModel');

describe('lesson result controllers', () => {
  let req;
  let res;

  beforeEach(() => {
    require('../helpers/expectedConsole')('log', ['📝 Inserting lesson result', '✅ Lesson result inserted']);
    require('../helpers/expectedConsole')('error', ['❌ No studentId', '❌ Missing parameters:']);
    req = {
      user: { id: 7 },
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('insertLessonResultController', () => {
    const validBody = {
      lessonId: 2,
      finishedTime: '2025-05-22T10:00:00Z',
      averageScore: 7.5,
      feedback: 'Good job'
    };

    it('requires an authenticated user', async () => {
      req.user = undefined;
      req.body = validBody;

      await insertLessonResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(insertLessonResult).not.toHaveBeenCalled();
    });

    it('validates required result fields', async () => {
      req.body = { lessonId: 2 };

      await insertLessonResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(insertLessonResult).not.toHaveBeenCalled();
    });

    it('uses the authenticated student id when inserting', async () => {
      req.body = { ...validBody, studentId: 99 };
      const inserted = { id: 10, studentId: 7, ...validBody };
      insertLessonResult.mockResolvedValue(inserted);

      await insertLessonResultController(req, res);

      expect(insertLessonResult).toHaveBeenCalledWith({ studentId: 7, ...validBody });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(inserted);
    });
  });

  describe('getLessonResultController', () => {
    it('requires an authenticated user', async () => {
      req.user = undefined;
      req.query = { lessonId: 2 };

      await getLessonResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(getLessonResult).not.toHaveBeenCalled();
    });

    it('requires a lesson id', async () => {
      await getLessonResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(getLessonResult).not.toHaveBeenCalled();
    });

    it('ignores a caller supplied student id', async () => {
      req.query = { studentId: 99, lessonId: 2 };
      const results = [{ id: 1 }];
      getLessonResult.mockResolvedValue(results);

      await getLessonResultController(req, res);

      expect(getLessonResult).toHaveBeenCalledWith(7, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });

  describe('getRecentlyLessonResultController', () => {
    it('requires an authenticated user', async () => {
      req.user = undefined;

      await getRecentlyLessonResultController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(getRecentlyLessonResult).not.toHaveBeenCalled();
    });

    it('ignores the student id in the route', async () => {
      req.params = { studentId: 99 };
      const results = [{ id: 1 }];
      getRecentlyLessonResult.mockResolvedValue(results);

      await getRecentlyLessonResultController(req, res);

      expect(getRecentlyLessonResult).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });
});
