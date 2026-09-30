const { uploadRecording } = require('../../controllers/record.controller');

describe('Kiểm thử hàm uploadRecording', () => {
  let req, res;

  beforeEach(() => {
    require('../helpers/expectedConsole')('log', ['Đã nhận file:']);
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Trả về lỗi 400 khi không có file ghi âm được gửi lên', () => {
    req.file = undefined;

    uploadRecording(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Không có file ghi âm nào được gửi lên.' });
  });

  test('Trả về thành công khi có file ghi âm được gửi lên', () => {
    req.file = {
      originalname: 'test-audio.mp3'
    };

    uploadRecording(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Ghi âm đã được tải lên thành công.' });
  });
});
