const fetch = require("node-fetch"); // Nếu dùng Node <18, còn Node 18+ thì không cần
const { postJsonWithDeadline } = require('../utils/providerRequest');
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getGeminiFeedback({ ieltsResult, assessment, transcriptText, miscueWords }) {
  const prompt = `
You are a native English teacher, specializing in evaluating and guiding learners to improve their English pronunciation. Below are the pronunciation assessment results of a student:

- Estimated IELTS equivalent score: ${ieltsResult.band} (${ieltsResult.totalScore})
- Accuracy: ${assessment.AccuracyScore}
- Fluency: ${assessment.FluencyScore}
- Completeness: ${assessment.CompletenessScore}
- Overall Pronunciation Score: ${assessment.PronScore}
- Transcript recognized by the system: "${transcriptText}"
- Mispronounced words: ${miscueWords.join(", ")}

Based on this information, please provide **detailed feedback in English**, including:
1. An overall evaluation of the student’s pronunciation level
2. Specific points the student needs to improve (sounds, words, clusters, etc.)
3. Suggested practice exercises suitable for the student
4. Encouraging advice on how to learn and practice pronunciation more effectively

Notes:
- Write as if you are giving direct feedback to the student.
- Use a friendly, supportive, and easy-to-understand tone.
- Provide simple examples if needed.
- Avoid overly technical or complicated linguistic terms.
`;

  try {
    const data = await postJsonWithDeadline(fetch,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
          contents: [{ parts: [{ text: prompt }] }],
      }
    );
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini feedback unavailable");
    return null;
  }
}

module.exports = {
  getGeminiFeedback,
};
