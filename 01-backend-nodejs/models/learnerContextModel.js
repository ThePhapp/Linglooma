const db = require('../db');

async function getLearnerContext(userId, currentSkill = null) {
  const [profile, mistakes] = await Promise.all([
    db.query('SELECT target_band, weak_skills FROM learning_profiles WHERE user_id = $1', [userId]),
    db.query(
      `SELECT skill, category, problem FROM learning_mistakes
       WHERE user_id = $1 AND status = 'review'
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    )
  ]);
  const row = profile.rows[0];
  return {
    targetBand: row?.target_band ? Number(row.target_band) : null,
    weakSkills: Array.isArray(row?.weak_skills) ? row.weak_skills.slice(0, 5) : [],
    recentMistakes: mistakes.rows.map(item => ({ skill: item.skill, category: item.category, problem: String(item.problem).slice(0, 240) })),
    currentSkill: ['speaking', 'writing', 'reading', 'listening'].includes(currentSkill) ? currentSkill : null
  };
}

module.exports = { getLearnerContext };
