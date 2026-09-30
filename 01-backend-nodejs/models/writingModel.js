const pool = require('../db');
const {
  evaluateWritingWithGemini, validateWritingEvaluation, WritingEvaluationError
} = require('../services/geminiWritingService');

/**
 * Lấy danh sách tất cả đề Writing
 */
async function getAllPrompts() {
  const query = `
    SELECT id, title, task_type, prompt, difficulty, topic, min_words as word_limit, time_limit
    FROM writing_tasks
    WHERE is_active = true
    ORDER BY task_type, difficulty, id
  `;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Lấy chi tiết một đề Writing
 */
async function getPromptById(promptId) {
  const query = `
    SELECT id, title, task_type, prompt, difficulty, topic, min_words as word_limit, time_limit, sample_answer
    FROM writing_tasks
    WHERE id = $1 AND is_active = true
  `;
  const result = await pool.query(query, [promptId]);
  return result.rows[0];
}

/**
 * Nộp bài Writing và chấm điểm bằng AI
 */
async function submitWriting({ promptId, studentId, essayText }) {
  // Each pool query commits and releases its client before evaluation starts.
  const promptQuery = `
    SELECT task_type, prompt, min_words as word_limit
    FROM writing_tasks
    WHERE id = $1
  `;
  const promptResult = await pool.query(promptQuery, [promptId]);
  const prompt = promptResult.rows[0];

  if (!prompt) {
    throw new Error('Prompt not found');
  }

  const wordCount = essayText.trim().split(/\s+/).length;
  const submissionQuery = `
    INSERT INTO writing_submissions (task_id, user_id, essay_text, word_count, is_completed)
    VALUES ($1, $2, $3, $4, false)
    RETURNING id, submitted_at
  `;
  const submissionResult = await pool.query(submissionQuery, [
    promptId,
    studentId,
    essayText,
    wordCount
  ]);
  const submission = submissionResult.rows[0];

  let evaluation;
  try {
    evaluation = validateWritingEvaluation(await evaluateWritingWithGemini({
      taskType: prompt.task_type,
      promptText: prompt.prompt,
      essayText,
      wordCount
    }));
  } catch {
    const error = new WritingEvaluationError();
    error.submissionId = submission.id;
    throw error;
  }

  // Scores and completion are persisted together, only after validation.
  const updateQuery = `
    UPDATE writing_submissions
    SET
      overall_band = $1,
      task_achievement = $2,
      coherence_cohesion = $3,
      lexical_resource = $4,
      grammatical_range = $5,
      feedback_overall = $6,
      feedback_task_achievement = $7,
      feedback_coherence = $8,
      feedback_vocabulary = $9,
      feedback_grammar = $10,
      suggestions = $11,
      is_completed = true
    WHERE id = $12
    RETURNING id
  `;
  const updateValues = [
    evaluation.scores.overall_band,
    evaluation.scores.task_achievement,
    evaluation.scores.coherence_cohesion,
    evaluation.scores.lexical_resource,
    evaluation.scores.grammar_accuracy,
    evaluation.overall_feedback,
    evaluation.strengths,
    evaluation.structure_feedback,
    JSON.stringify(evaluation.vocabulary_suggestions),
    JSON.stringify(evaluation.grammar_errors),
    evaluation.improvement_tips,
    submission.id
  ];
  const updateResult = await pool.query(updateQuery, updateValues);
  if (updateResult.rows.length === 0) {
    throw new Error('Submission not found');
  }

  return {
    submissionId: submission.id,
    submittedAt: submission.submitted_at,
    wordCount,
    scores: evaluation.scores,
    feedback: {
      overall_feedback: evaluation.overall_feedback,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      grammar_errors: evaluation.grammar_errors,
      vocabulary_suggestions: evaluation.vocabulary_suggestions,
      structure_feedback: evaluation.structure_feedback,
      improvement_tips: evaluation.improvement_tips
    }
  };
}

/**
 * Lấy lịch sử làm bài của học sinh
 */
async function getStudentSubmissions(studentId) {
  const query = `
    SELECT 
      s.id as submission_id,
      s.submitted_at,
      s.word_count,
      t.title,
      t.task_type,
      t.difficulty,
      t.topic,
      s.overall_band
    FROM writing_submissions s
    JOIN writing_tasks t ON s.task_id = t.id
    WHERE s.user_id = $1
    ORDER BY s.submitted_at DESC
  `;
  const result = await pool.query(query, [studentId]);
  return result.rows;
}

/**
 * Lấy chi tiết kết quả một bài làm
 */
async function getSubmissionDetail(submissionId, studentId) {
  const query = `
    SELECT 
      s.id as submission_id,
      s.essay_text,
      s.word_count,
      s.submitted_at,
      t.title,
      t.task_type,
      t.prompt,
      t.difficulty,
      t.topic,
      t.min_words as word_limit,
      s.task_achievement,
      s.coherence_cohesion,
      s.lexical_resource,
      s.grammatical_range as grammar_accuracy,
      s.overall_band,
      s.feedback_overall as overall_feedback,
      s.feedback_task_achievement as strengths,
      s.feedback_coherence as structure_feedback,
      s.feedback_vocabulary as vocabulary_suggestions,
      s.feedback_grammar as grammar_errors,
      s.suggestions as improvement_tips
    FROM writing_submissions s
    JOIN writing_tasks t ON s.task_id = t.id
    WHERE s.id = $1 AND s.user_id = $2
  `;
  const result = await pool.query(query, [submissionId, studentId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  
  // Parse JSON fields safely
  let grammarErrors = [];
  let vocabSuggestions = [];
  
  try {
    if (row.grammar_errors) {
      grammarErrors = typeof row.grammar_errors === 'string' 
        ? JSON.parse(row.grammar_errors) 
        : row.grammar_errors;
    }
  } catch (err) {
    console.error('Error parsing grammar_errors:', err);
    grammarErrors = [];
  }
  
  try {
    if (row.vocabulary_suggestions) {
      vocabSuggestions = typeof row.vocabulary_suggestions === 'string' 
        ? JSON.parse(row.vocabulary_suggestions) 
        : row.vocabulary_suggestions;
    }
  } catch (err) {
    console.error('Error parsing vocabulary_suggestions:', err);
    vocabSuggestions = [];
  }
  
  return {
    ...row,
    grammar_errors: grammarErrors,
    vocabulary_suggestions: vocabSuggestions
  };
}

module.exports = {
  getAllPrompts,
  getPromptById,
  submitWriting,
  getStudentSubmissions,
  getSubmissionDetail
};
