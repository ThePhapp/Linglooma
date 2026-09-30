import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./components/MessageBubble";
import apiClient from "@/services/apiClient";

export default function VoiceChat() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationLength, setConversationLength] = useState(0);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("access_token");

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        who: "ai",
        type: "text",
        text: "👋 Hello! I'm your English AI assistant. I'm here to help you improve your English skills. How can I assist you today?",
      }
    ]);
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);

    recognition.onerror = (e) => {
      console.error("❌ SpeechRecognition error:", e);
      setRecording(false);
    };

    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript + " ";
      }
      setDraftText(transcript.trim());
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    if (recording) {
      recognitionRef.current.stop();
    } else {
      setDraftText("");
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (!draftText.trim()) return;

    const newMsg = {
      id: Date.now(),
      who: "user",
      type: "text",
      text: draftText,
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraftText("");
    setIsTyping(true);

    try {
      const data = await apiClient.post("/api/chat", 
        { message: newMsg.text },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          who: "ai",
          type: "text",
          text: data.reply,
        },
      ]);

      if (data.metadata?.conversationLength) {
        setConversationLength(data.metadata.conversationLength);
      }
    } catch (err) {
      console.error("❌ Error calling API:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          who: "ai",
          type: "text",
          text: `⚠️ Sorry, I couldn't process your request. ${errorMessage || 'Please try again.'}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear the entire conversation?")) {
      return;
    }

    try {
      await apiClient.delete("/api/chat", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setMessages([
        {
          id: Date.now(),
          who: "ai",
          type: "text",
          text: "👋 Hello! I'm your English AI assistant. How can I help you today?",
        }
      ]);
      setConversationLength(0);
    } catch (err) {
      console.error("❌ Error clearing chat:", err);
      alert("Failed to clear conversation. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              English AI Assistant
            </h1>
            <p className="text-xs text-gray-500">
              {conversationLength > 0 ? `${conversationLength} messages` : "Ready to help"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClearChat}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
          title="Clear conversation"
        >
          🗑️ <span className="max-sm:hidden">Clear</span>
        </button>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow-md max-w-[70%]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Draft preview */}
        {draftText && (
          <div className="flex justify-end">
            <div className="max-w-[70%] rounded-2xl px-5 py-3 shadow-md border-2 border-dashed border-blue-300 bg-blue-50/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 italic">{draftText}</span>
                <button
                  onClick={() => setDraftText("")}
                  className="ml-2 text-red-500 hover:text-red-600 transition font-bold"
                  title="Clear draft"
                >
                  ✖️
                </button>
              </div>
              <span className="text-xs text-gray-500">Press Enter to send...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Controls */}
      <footer className="bg-white/90 backdrop-blur-lg shadow-lg px-6 py-4 sticky bottom-0 border-t border-purple-100">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          {/* Voice recording button */}
          <button
            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 transform active:scale-95 ${
              recording
                ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse text-white scale-110"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            }`}
            onClick={toggleRecording}
            title={recording ? "Stop recording" : "Start voice input"}
          >
            {recording ? "⏹️" : "🎙️"}
          </button>

          {/* Text input */}
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice input..."
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none transition-colors duration-200"
            rows="1"
            style={{ maxHeight: '100px' }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!draftText.trim()}
            className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200 transform active:scale-95 ${
              draftText.trim()
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>Send</span>
              <span>📤</span>
            </span>
          </button>
        </div>

        {/* Tips */}
        <div className="text-center mt-2 text-xs text-gray-500">
          💡 Tip: Press Enter to send, or use 🎙️ voice input for speaking practice
        </div>
      </footer>
    </div>
  );
}
