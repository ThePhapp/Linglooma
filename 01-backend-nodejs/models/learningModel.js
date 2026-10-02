const db = require('../db');
const intelligence = require('./learningIntelligenceModel');

const toNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toIsoString = value => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizeSpeaking = row => ({
  id: `speaking-${row.id}`,
  sourceId: row.id,
  skill: 'speaking',
  activity: row.activity || 'Speaking practice',
  score: toNumber(row.score),
  scoreScale: 9,
  status: 'completed',
  completedAt: toIsoString(row.completed_at),
  href: row.lesson_id ? `/admin/features/feedback/${row.lesson_id}` : '/admin/features/speaking/history'
});

const normalizeWriting = row => ({
  id: `writing-${row.id}`,
  sourceId: row.id,
  skill: 'writing',
  activity: row.activity || 'Writing practice',
  score: toNumber(row.score),
  scoreScale: 9,
  status: row.is_completed ? 'completed' : 'feedback_pending',
  completedAt: toIsoString(row.completed_at),
  href: `/admin/features/writing/submissions/${row.id}`
});

const normalizeReading = row => ({
  id: `reading-${row.id}`,
  sourceId: row.id,
  skill: 'reading',
  activity: row.activity || 'Reading practice',
  score: toNumber(row.score),
  scoreScale: 100,
  status: 'completed',
  completedAt: toIsoString(row.completed_at),
  href: row.passage_id ? `/admin/features/reading/${row.passage_id}` : '/admin/features/reading'
});

const normalizeListening = row => ({
  id: `listening-${row.id}`,
  sourceId: row.id,
  skill: 'listening',
  activity: row.activity || 'Listening practice',
  score: toNumber(row.score),
  scoreScale: 100,
  status: 'completed',
  completedAt: toIsoString(row.completed_at),
  href: '/admin/features/listening'
});

async function getPracticeHistory(userId) {
  const [speaking, writing, reading, listening] = await Promise.all([
    db.query(
      `SELECT lr.id, lr.lessonid AS lesson_id, l.name AS activity,
              lr.averagescore AS score, lr.finishedtime AS completed_at
       FROM lessonresult lr
       LEFT JOIN lesson l ON l.id = lr.lessonid
       WHERE lr.studentid = $1`,
      [userId]
    ),
    db.query(
      `SELECT ws.id, wt.title AS activity, ws.overall_band AS score,
              ws.is_completed, ws.submitted_at AS completed_at
       FROM writing_submissions ws
       INNER JOIN writing_tasks wt ON wt.id = ws.task_id
       WHERE ws.user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT ra.id, ra.passage_id, rp.title AS activity,
              CASE WHEN ra.max_score > 0
                THEN ROUND(100.0 * ra.total_score / ra.max_score, 2)
                ELSE 0 END AS score,
              ra.submitted_at AS completed_at
       FROM reading_attempts ra
       INNER JOIN reading_passages rp ON rp.id = ra.passage_id
       WHERE ra.user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT id, metadata->>'title' AS activity, score, completed_at
       FROM practice_sessions
       WHERE user_id = $1 AND skill = 'listening' AND status = 'completed'`,
      [userId]
    )
  ]);

  return [
    ...speaking.rows.map(normalizeSpeaking),
    ...writing.rows.map(normalizeWriting),
    ...reading.rows.map(normalizeReading),
    ...listening.rows.map(normalizeListening)
  ].sort((a, b) => (Date.parse(b.completedAt) || 0) - (Date.parse(a.completedAt) || 0));
}

function calculateProgress(history) {
  return ['speaking', 'writing', 'reading', 'listening'].map(skill => {
    const attempts = history.filter(item => item.skill === skill);
    const scored = attempts.filter(item => item.score !== null && item.status === 'completed');
    const score = scored.length
      ? Math.round((scored.reduce((sum, item) => sum + item.score, 0) / scored.length) * 10) / 10
      : null;
    return {
      skill,
      score,
      scoreScale: ['reading', 'listening'].includes(skill) ? 100 : 9,
      attempts: attempts.length,
      latestAt: attempts[0]?.completedAt || null,
      hasData: attempts.length > 0
    };
  });
}

function buildRecommendations(progress, history) {
  const recommendations = [];
  const pendingWriting = history.find(item => item.skill === 'writing' && item.status === 'feedback_pending');
  if (pendingWriting) {
    recommendations.push({
      id: 'writing-feedback-pending',
      skill: 'writing',
      title: 'Review your saved writing submission',
      reason: 'Your essay is safe, but its AI feedback is still pending.',
      href: pendingWriting.href,
      priority: 'high'
    });
  }

  const scored = progress
    .filter(item => item.score !== null)
    .map(item => ({ ...item, normalizedScore: item.score / item.scoreScale }));
  if (scored.length) {
    const weakest = scored.sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
    const config = {
      speaking: { title: 'Build speaking consistency', reason: 'Speaking is currently your lowest saved result.', href: '/admin/features/lesson' },
      writing: { title: 'Strengthen your next essay', reason: 'Writing is currently your lowest saved result.', href: '/admin/features/writing' },
      reading: { title: 'Target reading accuracy', reason: 'Reading is currently your lowest saved result.', href: '/admin/features/reading' },
      listening: { title: 'Build listening accuracy', reason: 'Listening is currently your lowest saved result.', href: '/admin/features/listening' }
    }[weakest.skill];
    recommendations.push({ id: `focus-${weakest.skill}`, skill: weakest.skill, ...config, priority: 'high' });
  }

  const practiced = new Set(history.map(item => item.skill));
  const unpracticed = [
    { skill: 'reading', title: 'Complete your first reading practice', href: '/admin/features/reading' },
    { skill: 'writing', title: 'Complete your first writing practice', href: '/admin/features/writing' },
    { skill: 'speaking', title: 'Complete your first speaking practice', href: '/admin/features/lesson' },
    { skill: 'listening', title: 'Complete your first listening practice', href: '/admin/features/listening' }
  ].find(item => !practiced.has(item.skill));
  if (unpracticed) {
    recommendations.push({ ...unpracticed, id: `start-${unpracticed.skill}`, reason: 'There is no saved result for this skill yet.', priority: 'normal' });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'continue-practice',
      skill: history[0]?.skill || 'speaking',
      title: 'Continue regular practice',
      reason: 'Another focused session will add evidence to your progress trend.',
      href: '/admin/features',
      priority: 'normal'
    });
  }
  return recommendations.slice(0, 3);
}

function buildWeeklyReview(history, progress) {
  const now = Date.now();
  const week = history.filter(item => now - Date.parse(item.completedAt) <= 7 * 86400000);
  const counts = week.reduce((result, item) => ({ ...result, [item.skill]: (result[item.skill] || 0) + 1 }), {});
  const mostPracticed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const scored = progress.filter(item => item.score !== null).map(item => ({ ...item, normalized: item.score / item.scoreScale }));
  const needsAttention = scored.sort((a, b) => a.normalized - b.normalized)[0]?.skill || null;
  return { practicesCompleted: week.filter(item => item.status === 'completed').length, mostPracticed, needsAttention };
}

function deriveAchievements(history) {
  const achievements = [];
  if (history.some(item => item.skill === 'speaking')) achievements.push({ id: 'first-speaking', title: 'First Speaking Practice' });
  if (history.length >= 10) achievements.push({ id: 'ten-practices', title: '10 Practices Completed' });
  const days = [...new Set(history.map(item => item.completedAt?.slice(0, 10)).filter(Boolean))].sort().reverse();
  let streak = 0;
  for (let index = 0; index < days.length; index += 1) {
    const expected = new Date(); expected.setUTCHours(0, 0, 0, 0); expected.setUTCDate(expected.getUTCDate() - index);
    if (days[index] === expected.toISOString().slice(0, 10)) streak += 1; else break;
  }
  if (streak >= 7) achievements.push({ id: 'seven-day-streak', title: '7-day Study Streak' });
  return achievements;
}

async function getLearningOverview(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const [history, profile, todayPractice, dueMistakes, activeSessions] = await Promise.all([
    getPracticeHistory(userId),
    intelligence.getProfile(userId),
    intelligence.getStudyPlan(userId, today, today),
    intelligence.listMistakes(userId, { status: 'review', skill: null, dueOnly: true, search: '' }),
    intelligence.getActiveSessions(userId)
  ]);
  const progress = calculateProgress(history);
  return {
    profile,
    progress,
    todayPractice,
    dueMistakes: dueMistakes.length,
    activeSessions,
    recentActivity: history.slice(0, 5),
    recommendations: buildRecommendations(progress, history),
    weeklyReview: buildWeeklyReview(history, progress),
    achievements: deriveAchievements(history),
    summary: {
      totalPractices: history.length,
      completedPractices: history.filter(item => item.status === 'completed').length,
      activeSkills: new Set(history.map(item => item.skill)).size
    }
  };
}

module.exports = { getPracticeHistory, getLearningOverview, calculateProgress, buildRecommendations, buildWeeklyReview, deriveAchievements };
