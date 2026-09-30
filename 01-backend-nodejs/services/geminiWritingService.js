const fetch = require("node-fetch");
const { postJsonWithDeadline } = require('../utils/providerRequest');
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY not found in environment variables!");
}

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
  const scoreFields = [
    'task_achievement', 'coherence_cohesion', 'lexical_resource',
    'grammar_accuracy', 'overall_band'
  ];
  const textFields = [
    'overall_feedback', 'strengths', 'weaknesses', 'structure_feedback', 'improvement_tips'
  ];
  const validItems = (items, fields) => Array.isArray(items) && items.every(
    item => isObject(item) && fields.every(field => isText(item[field]))
  );

  if (!isObject(evaluation) || !isObject(evaluation.scores) ||
      scoreFields.some(field => !Number.isFinite(evaluation.scores[field]) ||
        evaluation.scores[field] < 0 || evaluation.scores[field] > 9) ||
      textFields.some(field => !isText(evaluation[field])) ||
      !validItems(evaluation.grammar_errors, ['error', 'correction', 'explanation']) ||
      !validItems(evaluation.vocabulary_suggestions, ['word', 'suggestion', 'context'])) {
    throw new WritingEvaluationError();
  }

  return evaluation;
}

/**
 * Chấm bài Writing IELTS bằng AI Gemini
 * @param {Object} params
 * @param {string} params.taskType - Task 1 hoặc Task 2
 * @param {string} params.promptText - Đề bài
 * @param {string} params.essayText - Bài viết của học sinh
 * @param {number} params.wordCount - Số từ trong bài viết
 * @returns {Promise<Object>} Kết quả chấm bài
 */
async function evaluateWritingWithGemini({ taskType, promptText, essayText, wordCount }) {
  const minWords = taskType === 'Task 1' ? 150 : 250;
  
  const prompt = `
You are an experienced IELTS examiner specializing in Writing assessment. You need to evaluate the following IELTS ${taskType} essay according to official IELTS Writing band descriptors.

**Essay Prompt:**
${promptText}

**Student's Essay (${wordCount} words):**
${essayText}

**Your task:**
Evaluate this essay using the four IELTS Writing criteria and provide detailed feedback in JSON format.

Return ONLY a valid JSON object (no markdown, no explanations outside JSON) with this exact structure:

{
  "scores": {
    "task_achievement": <float 0-9>,
    "coherence_cohesion": <float 0-9>,
    "lexical_resource": <float 0-9>,
    "grammar_accuracy": <float 0-9>,
    "overall_band": <float 0-9>
  },
  "overall_feedback": "<2-3 sentences summarizing the essay quality>",
  "strengths": "<bullet points of what the student did well>",
  "weaknesses": "<bullet points of areas needing improvement>",
  "grammar_errors": [
    {
      "error": "<incorrect sentence or phrase>",
      "correction": "<corrected version>",
      "explanation": "<why it's wrong and how to fix it>"
    }
  ],
  "vocabulary_suggestions": [
    {
      "word": "<basic/repetitive word used>",
      "suggestion": "<better alternative>",
      "context": "<example sentence using the suggestion>"
    }
  ],
  "structure_feedback": "<feedback on essay organization, paragraphing, introduction, conclusion>",
  "improvement_tips": "<3-5 specific actionable tips to improve writing>"
}

**Evaluation Guidelines:**
1. Task Achievement (Task 1) / Task Response (Task 2): Does the essay address all parts of the task? Is the response clear and well-developed?
2. Coherence and Cohesion: Is the essay logically organized? Are ideas connected smoothly?
3. Lexical Resource: Range and accuracy of vocabulary. Avoid repetition.
4. Grammatical Range and Accuracy: Variety of sentence structures, accuracy of grammar.

**Note:** 
- If word count is less than ${minWords}, deduct points from Task Achievement/Response.
- Be constructive but honest in feedback.
- Identify specific errors with clear corrections.
- Overall band should be the average of the four criteria, rounded to nearest 0.5.
`;

  try {
    if (!GEMINI_API_KEY) {
      throw new WritingEvaluationError();
    }
    console.log("🤖 Calling Gemini API for essay evaluation...");
    console.log("Task Type:", taskType);
    console.log("Word Count:", wordCount);
    console.log("Essay length:", essayText.length, "characters");
    
    const data = await postJsonWithDeadline(fetch,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,  // Lower temperature for more consistent scoring
            topK: 40,
            topP: 0.95,
          },
      }
    );
    const candidate = data?.candidates?.[0];
    const responseText = candidate?.content?.parts?.[0]?.text;

    if (data?.error || (candidate?.finishReason && candidate.finishReason !== 'STOP') ||
        typeof responseText !== 'string' || !responseText.trim()) {
      throw new WritingEvaluationError();
    }

    console.log("✅ Got response from Gemini, length:", responseText.length);
    
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = responseText.trim();
    const fenced = jsonText.match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```$/i);
    if (fenced) {
      jsonText = fenced[1];
    }

    console.log("📝 Parsing JSON response...");
    const evaluation = validateWritingEvaluation(JSON.parse(jsonText));

    console.log("✅ Essay evaluated successfully!");
    console.log("Overall band:", evaluation.scores.overall_band);
    return evaluation;
    
  } catch {
    throw new WritingEvaluationError();
  }
}

module.exports = {
  evaluateWritingWithGemini,
  validateWritingEvaluation,
  WritingEvaluationError,
};
