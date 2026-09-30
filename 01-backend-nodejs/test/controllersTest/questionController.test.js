const { getQuestionsByLesson } = require('../../controllers/questionController');
const { findQuestionBasedOnLesson } = require('../../models/questionModel');

jest.mock('../../models/questionModel');

describe('Kiểm thử hàm getQuestionsByLesson', () => {
  let req, res;

  beforeEach(() => {
    require('../helpers/expectedConsole')('error', ['Error fetching questions:']);
    req = {
      params: {
        lessonId: '123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Trả về danh sách câu hỏi khi lessonId hợp lệ và có dữ liệu', async () => {
    const fakeQuestions = {
      rows: [
        { id: 1, content: 'Câu hỏi 1' },
        { id: 2, content: 'Câu hỏi 2' }
      ]
    };
    findQuestionBasedOnLesson.mockResolvedValue(fakeQuestions);

    await getQuestionsByLesson(req, res);

    expect(findQuestionBasedOnLesson).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith({ questions: fakeQuestions.rows });
  });

  test('Thiếu lessonId → trả về lỗi 400', async () => {
    req.params.lessonId = undefined;

    await getQuestionsByLesson(req, res);

    expect(findQuestionBasedOnLesson).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing lessonId" });
  });

  test('Không tìm thấy câu hỏi nào cho lesson → trả về lỗi 404', async () => {
    findQuestionBasedOnLesson.mockResolvedValue({ rows: [] });

    await getQuestionsByLesson(req, res);

    expect(findQuestionBasedOnLesson).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No questions found for this lesson" });
  });

  test('Lỗi server khi truy vấn DB → trả về lỗi 500', async () => {
    findQuestionBasedOnLesson.mockRejectedValue(new Error("DB Error"));

    await getQuestionsByLesson(req, res);

    expect(findQuestionBasedOnLesson).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
