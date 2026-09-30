const fetch = require('node-fetch');
const { postJsonWithDeadline } = require('../utils/providerRequest');

const conversationHistory = new Map();
const MAX_SESSIONS = 500;
const MAX_MESSAGES = 20;
const IDLE_MS = 30 * 60 * 1000;
const SYSTEM_PROMPT = `You are an expert IELTS teacher and English language coach. Your role is to:
- Help students improve their English speaking, writing, reading, and listening skills
- Provide clear, constructive feedback on grammar, vocabulary, and pronunciation
- Explain IELTS exam strategies and tips
- Be encouraging, patient, and supportive
- Use simple language when explaining complex concepts
- Give examples when appropriate
- Keep responses concise but informative (max 150 words unless asked for more)

Always be friendly, professional, and focus on helping students achieve their IELTS goals.`;
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
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
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

async function askGemini(userMessage, accountId) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Chat provider unavailable');
  const session = getSession(accountId);
  const history = [
    ...session.history.slice(0, 2),
    ...session.history.slice(2).slice(-(MAX_MESSAGES - 4)),
    { role: 'user', parts: [{ text: userMessage }] },
  ];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  let data;
  try {
    data = await postJsonWithDeadline(fetch, url, {
      contents: history,
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    });
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
