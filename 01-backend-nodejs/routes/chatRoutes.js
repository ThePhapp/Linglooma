const express = require("express");
const { chatController, clearChatController } = require("../controllers/chatController.js");
const jwtauth = require('../middleware/jwtauth');

const router = express.Router();

// POST /api/chat - Send message
router.post("/chat", jwtauth, chatController);

// DELETE /api/chat - Clear conversation history
router.delete("/chat", jwtauth, clearChatController);

module.exports = router;
