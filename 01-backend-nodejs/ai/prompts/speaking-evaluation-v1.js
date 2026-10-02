const VERSION = 'speaking-evaluation-v1';

function buildSpeakingEvaluationPrompt({ ieltsResult, assessment, transcriptText, miscueWords }) {
  return `You are an IELTS speaking coach. Use only the measured speech-provider data below; do not invent scores.

Estimated band: ${ieltsResult.band}; raw score: ${ieltsResult.totalScore}
Accuracy: ${assessment.AccuracyScore}; Fluency: ${assessment.FluencyScore}; Completeness: ${assessment.CompletenessScore}; Pronunciation: ${assessment.PronScore}
Transcript: ${transcriptText}
Words to practise: ${miscueWords.slice(0, 30).join(', ') || 'none detected'}

Give concise, supportive feedback with four labeled sections: Overall, Strengths, Improve next, Practice. Include concrete exercises and examples. Treat provider measurements as evidence, not as an official IELTS result.`;
}

module.exports = { VERSION, buildSpeakingEvaluationPrompt };
