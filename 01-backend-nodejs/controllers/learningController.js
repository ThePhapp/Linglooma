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
  } catch {
    return res.status(500).json({ success: false, message: 'Learning overview could not be loaded' });
  }
}

module.exports = { getHistory, getOverview };
