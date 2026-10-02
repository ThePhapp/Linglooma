const learningModel = require('../models/learningModel');

async function getHistory(req, res) {
  try {
    const history = await learningModel.getPracticeHistory(req.user.id);
    const skill = typeof req.query.skill === 'string' ? req.query.skill.toLowerCase() : 'all';
    const allowed = new Set(['all', 'speaking', 'writing', 'reading', 'listening']);
    if (!allowed.has(skill)) return res.status(400).json({ success: false, message: 'Unsupported skill filter' });
    return res.json({ success: true, data: skill === 'all' ? history : history.filter(item => item.skill === skill) });
  } catch {
    return res.status(500).json({ success: false, message: 'Practice history could not be loaded' });
  }
}

async function getOverview(req, res) {
  try {
    const overview = await learningModel.getLearningOverview(req.user.id);
    return res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Learning overview failed', { code: error.code || 'UNKNOWN' });
    return res.status(500).json({ success: false, message: 'Learning overview could not be loaded' });
  }
}

async function exportLearningData(req, res) {
  try {
    const [history, mistakes, vocabulary] = await Promise.all([
      learningModel.getPracticeHistory(req.user.id),
      require('../models/learningIntelligenceModel').listMistakes(req.user.id, { status: null, skill: null, dueOnly: false, search: '' }),
      require('../models/learningIntelligenceModel').listVocabulary(req.user.id, { status: null, search: '' })
    ]);
    res.setHeader('Content-Disposition', `attachment; filename="linglooma-learning-data-${new Date().toISOString().slice(0, 10)}.json"`);
    return res.type('application/json').send(JSON.stringify({ exportedAt: new Date().toISOString(), history, mistakes, vocabulary }, null, 2));
  } catch { return res.status(500).json({ success: false, message: 'Learning data could not be exported' }); }
}

module.exports = { getHistory, getOverview, exportLearningData };
