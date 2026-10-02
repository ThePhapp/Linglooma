async function observeAiCall({ purpose, provider = 'gemini', model }, operation) {
  const started = Date.now();
  try {
    const result = await operation();
    if (process.env.NODE_ENV !== 'test') console.info('AI request', { purpose, provider, model, latencyMs: Date.now() - started, success: true });
    return result;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') console.warn('AI request', { purpose, provider, model, latencyMs: Date.now() - started, success: false });
    throw error;
  }
}

module.exports = { observeAiCall };
