const db = require('../db');

const REVIEW_DELAYS = [1, 3, 7, 14, 30];
const skillConfig = {
  speaking: { title: 'Speaking fluency practice', href: '/admin/features/lesson' },
  writing: { title: 'Writing task practice', href: '/admin/features/writing' },
  reading: { title: 'Reading accuracy practice', href: '/admin/features/reading' },
  listening: { title: 'Listening comprehension practice', href: '/admin/features/listening' },
  vocabulary: { title: 'Vocabulary review', href: '/admin/vocabulary' }
};

async function getProfile(userId) {
  const { rows } = await db.query('SELECT * FROM learning_profiles WHERE user_id = $1', [userId]);
  return rows[0] || null;
}

async function saveProfile(userId, profile) {
  const { rows } = await db.query(
    `INSERT INTO learning_profiles
      (user_id, target_band, current_level, exam_date, study_days_per_week, minutes_per_day, weekly_practice_goal, weak_skills, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET
       target_band = EXCLUDED.target_band, current_level = EXCLUDED.current_level,
       exam_date = EXCLUDED.exam_date, study_days_per_week = EXCLUDED.study_days_per_week,
       minutes_per_day = EXCLUDED.minutes_per_day, weekly_practice_goal = EXCLUDED.weekly_practice_goal,
       weak_skills = EXCLUDED.weak_skills, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, profile.targetBand, profile.currentLevel, profile.examDate || null, profile.studyDaysPerWeek,
      profile.minutesPerDay, profile.weeklyPracticeGoal, JSON.stringify(profile.weakSkills)]
  );
  return rows[0];
}

const dateKey = date => date.toISOString().slice(0, 10);

async function generateStudyPlan(userId, profile) {
  const skills = [...profile.weakSkills, 'vocabulary', 'reading', 'listening', 'speaking', 'writing']
    .filter((skill, index, all) => skillConfig[skill] && all.indexOf(skill) === index);
  const days = Math.min(profile.studyDaysPerWeek, 7);
  const selected = [];
  for (let offset = 0; selected.length < days && offset < 7; offset += 1) {
    const date = new Date();
    date.setUTCHours(12, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + offset);
    const skill = skills[selected.length % skills.length];
    const config = skillConfig[skill];
    const { rows } = await db.query(
      `INSERT INTO study_plan_items (user_id, scheduled_date, skill, title, duration_minutes, href)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, scheduled_date, title) DO UPDATE SET
         duration_minutes = EXCLUDED.duration_minutes, href = EXCLUDED.href
       RETURNING *`,
      [userId, dateKey(date), skill, config.title, profile.minutesPerDay, config.href]
    );
    selected.push(rows[0]);
  }
  return selected;
}

async function getStudyPlan(userId, fromDate, toDate) {
  const { rows } = await db.query(
    `SELECT * FROM study_plan_items
     WHERE user_id = $1 AND scheduled_date BETWEEN $2 AND $3
     ORDER BY scheduled_date, id`,
    [userId, fromDate, toDate]
  );
  return rows;
}

async function updatePlanItem(userId, itemId, status) {
  const { rows } = await db.query(
    `UPDATE study_plan_items SET status = $1,
       completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [status, itemId, userId]
  );
  return rows[0] || null;
}

async function replacePlanItem(userId, itemId) {
  const { rows } = await db.query('SELECT * FROM study_plan_items WHERE id = $1 AND user_id = $2', [itemId, userId]);
  const current = rows[0];
  if (!current) return null;
  const skills = Object.keys(skillConfig);
  const nextSkill = skills[(skills.indexOf(current.skill) + 1) % skills.length];
  const config = skillConfig[nextSkill];
  const updated = await db.query(
    `UPDATE study_plan_items SET skill = $1, title = $2, href = $3, status = 'planned', completed_at = NULL
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [nextSkill, config.title, config.href, itemId, userId]
  );
  return updated.rows[0];
}

async function listMistakes(userId, { status, skill, dueOnly, search }) {
  const params = [userId];
  const clauses = ['user_id = $1'];
  if (status) { params.push(status); clauses.push(`status = $${params.length}`); }
  if (skill) { params.push(skill); clauses.push(`skill = $${params.length}`); }
  if (dueOnly) clauses.push('next_review_at <= CURRENT_TIMESTAMP');
  if (search) { params.push(`%${search}%`); clauses.push(`(problem ILIKE $${params.length} OR original_answer ILIKE $${params.length} OR corrected_version ILIKE $${params.length})`); }
  const { rows } = await db.query(
    `SELECT * FROM learning_mistakes WHERE ${clauses.join(' AND ')} ORDER BY next_review_at, created_at DESC LIMIT 200`,
    params
  );
  return rows;
}

async function reviewMistake(userId, mistakeId, understood) {
  const { rows } = await db.query('SELECT review_stage FROM learning_mistakes WHERE id = $1 AND user_id = $2', [mistakeId, userId]);
  if (!rows[0]) return null;
  const stage = understood ? Math.min(Number(rows[0].review_stage) + 1, REVIEW_DELAYS.length) : 0;
  const delay = understood ? REVIEW_DELAYS[Math.max(stage - 1, 0)] : 1;
  const updated = await db.query(
    `UPDATE learning_mistakes SET status = $1, review_stage = $2,
       next_review_at = CURRENT_TIMESTAMP + ($3 * INTERVAL '1 day'), updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [understood && stage === REVIEW_DELAYS.length ? 'understood' : 'review', stage, delay, mistakeId, userId]
  );
  return updated.rows[0];
}

async function recordMistakes(userId, mistakes) {
  for (const mistake of mistakes) {
    await db.query(
      `INSERT INTO learning_mistakes
       (user_id, skill, category, original_answer, problem, suggestion, corrected_version, source_type, source_id, source_item_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [userId, mistake.skill, mistake.category, mistake.originalAnswer || null, mistake.problem,
        mistake.suggestion || null, mistake.correctedVersion || null, mistake.sourceType,
        mistake.sourceId || null, mistake.sourceItemId || null]
    );
  }
}

async function listVocabulary(userId, { status, search }) {
  const params = [userId];
  const clauses = ['user_id = $1'];
  if (status) { params.push(status); clauses.push(`status = $${params.length}`); }
  if (search) { params.push(`%${search}%`); clauses.push(`(word ILIKE $${params.length} OR meaning ILIKE $${params.length} OR topic ILIKE $${params.length})`); }
  const { rows } = await db.query(`SELECT * FROM vocabulary_items WHERE ${clauses.join(' AND ')} ORDER BY next_review_at, created_at DESC LIMIT 300`, params);
  return rows;
}

async function saveVocabulary(userId, item) {
  const { rows } = await db.query(
    `INSERT INTO vocabulary_items (user_id, word, meaning, example, topic, source, difficulty)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (user_id, word) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example,
       topic = EXCLUDED.topic, difficulty = EXCLUDED.difficulty, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, item.word, item.meaning, item.example || null, item.topic || null, item.source || 'manual', item.difficulty]
  );
  return rows[0];
}

async function reviewVocabulary(userId, itemId, known) {
  const { rows } = await db.query(
    `UPDATE vocabulary_items SET status = $1,
       next_review_at = CURRENT_TIMESTAMP + ($2 * INTERVAL '1 day'), updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND user_id = $4 RETURNING *`,
    [known ? 'known' : 'review', known ? 7 : 1, itemId, userId]
  );
  return rows[0] || null;
}

async function getActiveSessions(userId) {
  const { rows } = await db.query(
    `SELECT * FROM practice_sessions WHERE user_id = $1 AND status = 'in_progress'
     ORDER BY updated_at DESC LIMIT 20`, [userId]
  );
  return rows;
}

async function startSession(userId, { skill, mode, sourceId, metadata }) {
  const existing = await db.query(
    `SELECT * FROM practice_sessions WHERE user_id = $1 AND skill = $2 AND mode = $3
       AND COALESCE(source_id, 0) = COALESCE($4, 0) AND status = 'in_progress'
     ORDER BY updated_at DESC LIMIT 1`, [userId, skill, mode, sourceId || null]
  );
  if (existing.rows[0]) return existing.rows[0];
  const { rows } = await db.query(
    `INSERT INTO practice_sessions (user_id, skill, mode, source_id, metadata)
     VALUES ($1,$2,$3,$4,$5::jsonb) RETURNING *`,
    [userId, skill, mode, sourceId || null, JSON.stringify(metadata || {})]
  );
  return rows[0];
}

async function updateSession(userId, sessionId, { status, score, metadata }) {
  const { rows } = await db.query(
    `UPDATE practice_sessions SET status = COALESCE($1, status), score = COALESCE($2, score),
       metadata = COALESCE($3::jsonb, metadata), updated_at = CURRENT_TIMESTAMP,
       completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
     WHERE id = $4 AND user_id = $5 RETURNING *`,
    [status || null, score ?? null, metadata ? JSON.stringify(metadata) : null, sessionId, userId]
  );
  return rows[0] || null;
}

async function listBookmarks(userId) {
  const { rows } = await db.query('SELECT * FROM learning_bookmarks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows;
}

async function saveBookmark(userId, item) {
  const { rows } = await db.query(
    `INSERT INTO learning_bookmarks (user_id, item_type, source_id, title, href, metadata)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)
     ON CONFLICT (user_id, item_type, source_id) DO UPDATE SET title = EXCLUDED.title, href = EXCLUDED.href, metadata = EXCLUDED.metadata
     RETURNING *`,
    [userId, item.itemType, item.sourceId, item.title, item.href, JSON.stringify(item.metadata || {})]
  );
  return rows[0];
}

async function removeBookmark(userId, bookmarkId) {
  const { rows } = await db.query('DELETE FROM learning_bookmarks WHERE id = $1 AND user_id = $2 RETURNING id', [bookmarkId, userId]);
  return rows[0] || null;
}

module.exports = {
  getProfile, saveProfile, generateStudyPlan, getStudyPlan, updatePlanItem, replacePlanItem,
  listMistakes, reviewMistake, recordMistakes, listVocabulary, saveVocabulary, reviewVocabulary,
  getActiveSessions, startSession, updateSession, listBookmarks, saveBookmark, removeBookmark
};
