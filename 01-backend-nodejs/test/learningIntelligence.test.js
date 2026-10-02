jest.mock('../models/learningIntelligenceModel');

const model = require('../models/learningIntelligenceModel');
const controller = require('../controllers/learningIntelligenceController');
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

beforeEach(() => jest.clearAllMocks());

const validProfile = {
  targetBand: 7, currentLevel: 'intermediate', examDate: '2027-03-01',
  studyDaysPerWeek: 5, minutesPerDay: 30, weeklyPracticeGoal: 5,
  weakSkills: ['writing', 'speaking']
};

test('saves a validated profile for the authenticated user and generates a structured plan', async () => {
  model.saveProfile.mockResolvedValue({ user_id: 8, target_band: 7 });
  model.generateStudyPlan.mockResolvedValue([{ id: 1, skill: 'writing' }]);
  const res = response();
  await controller.saveProfile({ user: { id: 8 }, body: { ...validProfile, userId: 999 } }, res);
  expect(model.saveProfile).toHaveBeenCalledWith(8, validProfile);
  expect(model.generateStudyPlan).toHaveBeenCalledWith(8, validProfile);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});

test.each([
  { ...validProfile, targetBand: 10 },
  { ...validProfile, currentLevel: 'expert' },
  { ...validProfile, studyDaysPerWeek: 0 },
  { ...validProfile, minutesPerDay: 1000 },
  { ...validProfile, weakSkills: ['grammar'] },
  { ...validProfile, examDate: 'not-a-date' }
])('rejects invalid profile settings without persistence', async body => {
  const res = response();
  await controller.saveProfile({ user: { id: 8 }, body }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(model.saveProfile).not.toHaveBeenCalled();
});

test('updates only an owned plan item and validates status', async () => {
  model.updatePlanItem.mockResolvedValue({ id: 4, status: 'completed' });
  const res = response();
  await controller.updatePlanItem({ user: { id: 8 }, params: { id: '4' }, body: { status: 'completed', userId: 99 } }, res);
  expect(model.updatePlanItem).toHaveBeenCalledWith(8, '4', 'completed');

  const invalid = response();
  await controller.updatePlanItem({ user: { id: 8 }, params: { id: '4' }, body: { status: 'deleted' } }, invalid);
  expect(invalid.status).toHaveBeenCalledWith(400);
});

test('validates vocabulary before saving and uses authenticated ownership', async () => {
  model.saveVocabulary.mockResolvedValue({ id: 2, word: 'coherent' });
  const res = response();
  await controller.saveVocabulary({ user: { id: 8 }, body: { word: ' coherent ', meaning: 'logical', difficulty: 'hard', userId: 99 } }, res);
  expect(model.saveVocabulary).toHaveBeenCalledWith(8, expect.objectContaining({ word: 'coherent', meaning: 'logical' }));
  expect(res.status).toHaveBeenCalledWith(201);
});

test('starts a bounded practice session using authenticated ownership', async () => {
  model.startSession.mockResolvedValue({ id: 12, skill: 'listening' });
  const res = response();
  await controller.startSession({ user: { id: 8 }, body: { skill: 'listening', mode: 'dictation', sourceId: 2, metadata: { title: 'Daily Routine' }, userId: 99 } }, res);
  expect(model.startSession).toHaveBeenCalledWith(8, expect.objectContaining({ skill: 'listening', sourceId: 2 }));
  expect(res.status).toHaveBeenCalledWith(201);
});

test('rejects unsafe bookmark links before persistence', async () => {
  const res = response();
  await controller.saveBookmark({ user: { id: 8 }, body: { itemType: 'reading', sourceId: 2, title: 'Passage', href: 'https://untrusted.example' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(model.saveBookmark).not.toHaveBeenCalled();
});
