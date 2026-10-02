const VERSION = 'ielts-tutor-v2';

const actionInstructions = {
  explain_mistake: 'Explain the selected weakness with one clear rule and one example.',
  another_example: 'Give one new IELTS-relevant example and a short explanation.',
  make_easier: 'Reduce the difficulty and use simpler language.',
  make_harder: 'Increase the IELTS difficulty without making the task ambiguous.',
  practice_topic: 'Turn the topic into a short guided practice activity.',
  better_answer: 'Show a stronger answer, then identify two improvements.'
};

function buildTutorSystemPrompt(context = {}, action) {
  const safeContext = {
    targetBand: context.targetBand || null,
    weakSkills: Array.isArray(context.weakSkills) ? context.weakSkills.slice(0, 5) : [],
    recentMistakes: Array.isArray(context.recentMistakes) ? context.recentMistakes.slice(0, 5) : [],
    currentSkill: context.currentSkill || null
  };
  return `You are Linglooma IELTS Tutor. Give concise, constructive teaching support (maximum 180 words).
Use only the learner context below; do not claim knowledge that is absent.
Learner context: ${JSON.stringify(safeContext)}
${action && actionInstructions[action] ? `Requested action: ${actionInstructions[action]}` : ''}
Prioritize helping the learner understand and practise rather than doing all work for them.`;
}

module.exports = { VERSION, buildTutorSystemPrompt, actionInstructions };
