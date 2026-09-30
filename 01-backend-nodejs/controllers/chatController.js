const { askGemini, clearConversation, getConversationLength } = require("../services/chatService.js");
const rateWindows = new Map();
const RATE_WINDOW_MS = 60000;
const RATE_LIMIT = 10;
const MAX_RATE_WINDOWS = 5000;

async function chatController(req, res) {
  const { message } = req.body || {};
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Message is required and must be a string" });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  if (message.length > 2000) {
    return res.status(413).json({ error: "Message too long (max 2000 characters)" });
  }

  try {
    if (!req.user || !/^[1-9]\d*$/.test(String(req.user.id))) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const sessionId = String(req.user.id);
    const now = Date.now();
    for (const [id, window] of rateWindows) {
      if (now - window.start >= RATE_WINDOW_MS) rateWindows.delete(id);
    }
    const window = rateWindows.get(sessionId);
    if (window && window.count >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Chat rate limit exceeded' });
    }
    if (window) window.count++;
    else {
      if (rateWindows.size >= MAX_RATE_WINDOWS) rateWindows.delete(rateWindows.keys().next().value);
      rateWindows.set(sessionId, { start: now, count: 1 });
    }

    const reply = await askGemini(message, sessionId);
    
    const conversationLength = getConversationLength(sessionId);

    res.json({ 
      reply,
      metadata: {
        conversationLength,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat request failed');
    res.status(500).json({ 
      error: "Internal server error",
      message: "Unable to process your request at this time"
    });
  }
}

// Endpoint mới để xóa conversation
async function clearChatController(req, res) {
  try {
    if (!req.user || !/^[1-9]\d*$/.test(String(req.user.id))) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const sessionId = String(req.user.id);
    clearConversation(sessionId);
    
    res.json({ 
      success: true,
      message: "Conversation cleared successfully"
    });
  } catch (error) {
    console.error('Clear chat failed');
    res.status(500).json({ error: "Failed to clear conversation" });
  }
}

module.exports = {
  chatController,
  clearChatController
};
