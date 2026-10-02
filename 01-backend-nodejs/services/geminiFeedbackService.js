const fetch = require("node-fetch"); // Nếu dùng Node <18, còn Node 18+ thì không cần
const { postJsonWithDeadline } = require('../utils/providerRequest');
const { selectModel } = require('../ai/modelRouter');
const { observeAiCall } = require('../ai/observability');
const { buildSpeakingEvaluationPrompt } = require('../ai/prompts/speaking-evaluation-v1');
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getGeminiFeedback({ ieltsResult, assessment, transcriptText, miscueWords }) {
  const prompt = buildSpeakingEvaluationPrompt({ ieltsResult, assessment, transcriptText, miscueWords });
  const model = selectModel('speaking_evaluation');

  try {
    const data = await observeAiCall({ purpose: 'speaking_evaluation', model }, () => postJsonWithDeadline(fetch,
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
          contents: [{ parts: [{ text: prompt }] }],
      }
    ));
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini feedback unavailable");
    return null;
  }
}

module.exports = {
  getGeminiFeedback,
};
