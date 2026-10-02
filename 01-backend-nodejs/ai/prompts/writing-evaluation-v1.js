const VERSION = 'writing-evaluation-v1';

function buildWritingEvaluationPrompt({ taskType, promptText, essayText, wordCount }) {
  const minWords = taskType === 'Task 1' ? 150 : 250;
  return `You are an IELTS Writing examiner. Evaluate the ${taskType} response using official criteria.

Task: ${promptText}
Student response (${wordCount} words): ${essayText}

Return only valid JSON with this exact structure:
{
  "scores": { "task_achievement": 0, "coherence_cohesion": 0, "lexical_resource": 0, "grammar_accuracy": 0, "overall_band": 0 },
  "overall_feedback": "",
  "strengths": "",
  "weaknesses": "",
  "grammar_errors": [{ "error": "", "correction": "", "explanation": "" }],
  "vocabulary_suggestions": [{ "word": "", "suggestion": "", "context": "" }],
  "structure_feedback": "",
  "improvement_tips": ""
}
All scores must be numbers from 0 to 9. Overall band is the four-criterion average rounded to 0.5.
If the response is below ${minWords} words, reflect that in task achievement. Be specific, constructive, and concise.`;
}

module.exports = { VERSION, buildWritingEvaluationPrompt };
