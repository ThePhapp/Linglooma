const { getLessonController } = require('../../controllers/lessonController');
const { findLesson } = require('../../models/lessonModel');

jest.mock('../../models/lessonModel'); // Mock toàn bộ module

describe('Kiểm thử hàm getLessonController', () => {
    let req, res;

    beforeEach(() => {
        req = {}; // Không cần req cụ thể trong controller này
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks(); // Reset lại các hàm mock
    });

    test('Trả về danh sách bài học khi thành công', async () => {
        const fakeLessons = {
            rows: [
                { id: 1, title: 'Bài học 1' },
                { id: 2, title: 'Bài học 2' }
            ]
        };
        findLesson.mockResolvedValue(fakeLessons);

        await getLessonController(req, res);

        expect(findLesson).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeLessons.rows);
    });

    test('Trả về lỗi khi truy xuất bài học thất bại', async () => {
        findLesson.mockRejectedValue(new Error('Lỗi truy xuất'));

        await getLessonController(req, res);

        expect(findLesson).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Retriving lesson failed' });
    });

});
