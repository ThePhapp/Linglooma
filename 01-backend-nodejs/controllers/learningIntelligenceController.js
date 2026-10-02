const model = require('../models/learningIntelligenceModel');

const skills = new Set(['speaking', 'writing', 'reading', 'listening']);
const levels = new Set(['beginner', 'intermediate', 'advanced']);
const statuses = new Set(['planned', 'completed', 'skipped']);
const difficulties = new Set(['easy', 'medium', 'hard']);
const positiveId = value => /^(?:[1-9]\d*)$/.test(String(value)) && Number.isSafeInteger(Number(value));
const dateValue = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

function validateProfile(body = {}) {
  const targetBand = Number(body.targetBand);
  const studyDaysPerWeek = Number(body.studyDaysPerWeek);
  const minutesPerDay = Number(body.minutesPerDay);
  const weeklyPracticeGoal = Number(body.weeklyPracticeGoal);
  const weakSkills = Array.isArray(body.weakSkills) ? [...new Set(body.weakSkills.map(String))] : [];
  if (!Number.isFinite(targetBand) || targetBand < 0 || targetBand > 9 || !levels.has(body.currentLevel) ||
      (body.examDate && !dateValue(body.examDate)) || !Number.isInteger(studyDaysPerWeek) || studyDaysPerWeek < 1 || studyDaysPerWeek > 7 ||
      !Number.isInteger(minutesPerDay) || minutesPerDay < 5 || minutesPerDay > 240 ||
      !Number.isInteger(weeklyPracticeGoal) || weeklyPracticeGoal < 1 || weeklyPracticeGoal > 50 ||
      weakSkills.some(skill => !skills.has(skill))) return null;
  return { targetBand, currentLevel: body.currentLevel, examDate: body.examDate || null, studyDaysPerWeek, minutesPerDay, weeklyPracticeGoal, weakSkills };
}

async function getProfile(req, res) {
  try { return res.json({ success: true, data: await model.getProfile(req.user.id) }); }
  catch { return res.status(500).json({ success: false, message: 'Learning goals could not be loaded' }); }
}

async function saveProfile(req, res) {
  const profile = validateProfile(req.body);
  if (!profile) return res.status(400).json({ success: false, message: 'Invalid learning goal settings' });
  try {
    const saved = await model.saveProfile(req.user.id, profile);
    const plan = await model.generateStudyPlan(req.user.id, profile);
    return res.json({ success: true, data: { profile: saved, plan } });
  } catch { return res.status(500).json({ success: false, message: 'Learning goals could not be saved' }); }
}

async function getPlan(req, res) {
  const from = dateValue(req.query.from) ? req.query.from : new Date().toISOString().slice(0, 10);
  const toDate = new Date(`${from}T12:00:00Z`); toDate.setUTCDate(toDate.getUTCDate() + 13);
  const to = dateValue(req.query.to) ? req.query.to : toDate.toISOString().slice(0, 10);
  try { return res.json({ success: true, data: await model.getStudyPlan(req.user.id, from, to) }); }
  catch { return res.status(500).json({ success: false, message: 'Study plan could not be loaded' }); }
}

async function updatePlanItem(req, res) {
  if (!positiveId(req.params.id) || !statuses.has(req.body?.status)) return res.status(400).json({ success: false, message: 'Invalid plan update' });
  try {
    const item = await model.updatePlanItem(req.user.id, req.params.id, req.body.status);
    return item ? res.json({ success: true, data: item }) : res.status(404).json({ success: false, message: 'Plan item not found' });
  } catch { return res.status(500).json({ success: false, message: 'Plan item could not be updated' }); }
}

async function replacePlanItem(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid plan item ID' });
  try {
    const item = await model.replacePlanItem(req.user.id, req.params.id);
    return item ? res.json({ success: true, data: item }) : res.status(404).json({ success: false, message: 'Plan item not found' });
  } catch { return res.status(500).json({ success: false, message: 'Plan item could not be replaced' }); }
}

async function getMistakes(req, res) {
  const skill = req.query.skill && skills.has(req.query.skill) ? req.query.skill : null;
  const status = ['review', 'understood'].includes(req.query.status) ? req.query.status : null;
  try { return res.json({ success: true, data: await model.listMistakes(req.user.id, { skill, status, dueOnly: req.query.due === 'true', search: String(req.query.search || '').slice(0, 100) }) }); }
  catch { return res.status(500).json({ success: false, message: 'Mistakes could not be loaded' }); }
}

async function reviewMistake(req, res) {
  if (!positiveId(req.params.id) || typeof req.body?.understood !== 'boolean') return res.status(400).json({ success: false, message: 'Invalid review update' });
  try {
    const item = await model.reviewMistake(req.user.id, req.params.id, req.body.understood);
    return item ? res.json({ success: true, data: item }) : res.status(404).json({ success: false, message: 'Mistake not found' });
  } catch { return res.status(500).json({ success: false, message: 'Review progress could not be saved' }); }
}

async function getVocabulary(req, res) {
  const status = ['review', 'known'].includes(req.query.status) ? req.query.status : null;
  try { return res.json({ success: true, data: await model.listVocabulary(req.user.id, { status, search: String(req.query.search || '').slice(0, 100) }) }); }
  catch { return res.status(500).json({ success: false, message: 'Vocabulary could not be loaded' }); }
}

async function saveVocabulary(req, res) {
  const body = req.body || {};
  const word = typeof body.word === 'string' ? body.word.trim().slice(0, 200) : '';
  const meaning = typeof body.meaning === 'string' ? body.meaning.trim().slice(0, 2000) : '';
  if (!word || !meaning || !difficulties.has(body.difficulty || 'medium')) return res.status(400).json({ success: false, message: 'Word, meaning and valid difficulty are required' });
  try { return res.status(201).json({ success: true, data: await model.saveVocabulary(req.user.id, { ...body, word, meaning, difficulty: body.difficulty || 'medium' }) }); }
  catch { return res.status(500).json({ success: false, message: 'Vocabulary could not be saved' }); }
}

async function reviewVocabulary(req, res) {
  if (!positiveId(req.params.id) || typeof req.body?.known !== 'boolean') return res.status(400).json({ success: false, message: 'Invalid vocabulary review' });
  try {
    const item = await model.reviewVocabulary(req.user.id, req.params.id, req.body.known);
    return item ? res.json({ success: true, data: item }) : res.status(404).json({ success: false, message: 'Vocabulary item not found' });
  } catch { return res.status(500).json({ success: false, message: 'Vocabulary review could not be saved' }); }
}

module.exports = { getProfile, saveProfile, getPlan, updatePlanItem, replacePlanItem, getMistakes, reviewMistake, getVocabulary, saveVocabulary, reviewVocabulary };
