const models = {
  cheap: process.env.AI_MODEL_CHEAP || 'gemini-2.0-flash',
  capable: process.env.AI_MODEL_CAPABLE || 'gemini-2.0-flash'
};

const capablePurposes = new Set(['writing_evaluation', 'speaking_evaluation', 'tutor_reasoning']);

function selectModel(purpose) {
  return capablePurposes.has(purpose) ? models.capable : models.cheap;
}

module.exports = { selectModel };
