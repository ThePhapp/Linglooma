jest.mock('../../models/lessonModel');
const { findLessons } = require('../../models/lessonModel');
const { getAllLessonsController } = require('../../controllers/lessonController');

describe('speaking lesson catalog', () => {
  let res;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('returns lessons supplied by the filtered catalog model', async () => {
    const rows = [{ id: 1, name: 'Technology', difficulty: 'medium' }];
    findLessons.mockResolvedValue({ rows });
    await getAllLessonsController({}, res);
    expect(findLessons).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('does not expose database error details', async () => {
    findLessons.mockRejectedValue(new Error('private database host'));
    await getAllLessonsController({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unable to retrieve lessons' });
  });
});
