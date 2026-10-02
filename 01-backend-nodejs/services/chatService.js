const fetch = require('node-fetch');
const { postJsonWithDeadline } = require('../utils/providerRequest');
const { buildTutorSystemPrompt } = require('../ai/prompts/tutor-v2');
const { selectModel } = require('../ai/modelRouter');
const { observeAiCall } = require('../ai/observability');

const conversationHistory = new Map();
const MAX_SESSIONS = 500;
const MAX_MESSAGES = 20;
const IDLE_MS = 30 * 60 * 1000;
const GREETING = "Hello! I'm your IELTS AI assistant. I'm here to help you improve your English and prepare for the IELTS exam. How can I assist you today? 😊";

function getSession(accountId) {
  const now = Date.now();
  for (const [id, session] of conversationHistory) {
    if (now - session.lastUsed >= IDLE_MS) conversationHistory.delete(id);
  }
  let session = conversationHistory.get(accountId);
  if (!session) {
    if (conversationHistory.size >= MAX_SESSIONS) conversationHistory.delete(conversationHistory.keys().next().value);
    session = {
      history: [
        { role: 'user', parts: [{ text: buildTutorSystemPrompt() }] },
        { role: 'model', parts: [{ text: GREETING }] },
      ],
      lastUsed: now,
    };
  }
  session.lastUsed = now;
  conversationHistory.delete(accountId);
  conversationHistory.set(accountId, session);
  return session;
}

async function askGemini(userMessage, accountId, learnerContext = null, action = null) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Chat provider unavailable');
  const session = getSession(accountId);
  const systemMessages = [
    { role: 'user', parts: [{ text: buildTutorSystemPrompt(learnerContext || {}, action) }] },
    session.history[1]
  ];
  const history = [
    ...systemMessages,
    ...session.history.slice(2).slice(-(MAX_MESSAGES - 4)),
    { role: 'user', parts: [{ text: userMessage }] },
  ];
  const model = selectModel(action ? 'tutor_reasoning' : 'tutor_chat');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  let data;
  try {
    data = await observeAiCall({ purpose: action ? 'tutor_action' : 'tutor_chat', model }, () => postJsonWithDeadline(fetch, url, {
      contents: history,
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }));
  } catch {
    throw new Error('Chat provider unavailable');
  }
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof reply !== 'string' || !reply.trim()) {
    if (data?.promptFeedback?.blockReason) return '⚠️ Your message was blocked by safety filters. Please rephrase your question.';
    throw new Error('Chat provider unavailable');
  }
  session.history = [...history, { role: 'model', parts: [{ text: reply }] }];
  return reply;
}

function clearConversation(accountId) {
  conversationHistory.delete(accountId);
  return true;
}

function getConversationLength(accountId) {
  const session = conversationHistory.get(accountId);
  if (!session || Date.now() - session.lastUsed >= IDLE_MS) {
    conversationHistory.delete(accountId);
    return 0;
  }
  return session.history.length;
}

module.exports = { askGemini, clearConversation, getConversationLength };
