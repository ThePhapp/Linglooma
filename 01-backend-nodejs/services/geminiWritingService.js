const fetch = require('node-fetch');
const { postJsonWithDeadline } = require('../utils/providerRequest');
const { buildWritingEvaluationPrompt, VERSION } = require('../ai/prompts/writing-evaluation-v1');
const { selectModel } = require('../ai/modelRouter');
const { observeAiCall } = require('../ai/observability');
require('dotenv').config();

class WritingEvaluationError extends Error {
  constructor() {
    super('Writing evaluation is temporarily unavailable. Please try again.');
    this.name = 'WritingEvaluationError';
    this.code = 'WRITING_EVALUATION_UNAVAILABLE';
  }
}

function validateWritingEvaluation(evaluation) {
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const isText = value => typeof value === 'string' && value.trim().length > 0;
  const scoreFields = ['task_achievement', 'coherence_cohesion', 'lexical_resource', 'grammar_accuracy', 'overall_band'];
  const textFields = ['overall_feedback', 'strengths', 'weaknesses', 'structure_feedback', 'improvement_tips'];
  const validItems = (items, fields) => Array.isArray(items) && items.every(item => isObject(item) && fields.every(field => isText(item[field])));
  if (!isObject(evaluation) || !isObject(evaluation.scores) ||
      scoreFields.some(field => !Number.isFinite(evaluation.scores[field]) || evaluation.scores[field] < 0 || evaluation.scores[field] > 9) ||
      textFields.some(field => !isText(evaluation[field])) ||
      !validItems(evaluation.grammar_errors, ['error', 'correction', 'explanation']) ||
      !validItems(evaluation.vocabulary_suggestions, ['word', 'suggestion', 'context'])) throw new WritingEvaluationError();
  return evaluation;
}

async function evaluateWritingWithGemini(input) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new WritingEvaluationError();
    const model = selectModel('writing_evaluation');
    const prompt = buildWritingEvaluationPrompt(input);
    const data = await observeAiCall({ purpose: 'writing_evaluation', model }, () => postJsonWithDeadline(
      fetch,
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, topK: 40, topP: 0.95 } }
    ));
    const candidate = data?.candidates?.[0];
    const responseText = candidate?.content?.parts?.[0]?.text;
    if (data?.error || (candidate?.finishReason && candidate.finishReason !== 'STOP') || typeof responseText !== 'string' || !responseText.trim()) throw new WritingEvaluationError();
    let jsonText = responseText.trim();
    const fenced = jsonText.match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```$/i);
    if (fenced) jsonText = fenced[1];
    return validateWritingEvaluation(JSON.parse(jsonText));
  } catch {
    throw new WritingEvaluationError();
  }
}

module.exports = { evaluateWritingWithGemini, validateWritingEvaluation, WritingEvaluationError, PROMPT_VERSION: VERSION };
