import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./components/MessageBubble";
import apiClient from "@/services/apiClient";
import { Bot, Mic, Send, Square, Trash2, X } from "lucide-react";

export default function VoiceChat() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationLength, setConversationLength] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [useLearnerContext, setUseLearnerContext] = useState(true);
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
        text: "Hello! I'm your English AI assistant. How can I help you practise today?",
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
      console.error("SpeechRecognition error:", e);
      setStatusMessage("Voice input stopped. Check microphone permission and try again.");
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
      setStatusMessage("Voice input is not supported in this browser. You can still type a message.");
      return;
    }
    if (recording) {
      recognitionRef.current.stop();
    } else {
      setDraftText("");
      recognitionRef.current.start();
    }
  };

  const handleSend = async (action = null, actionMessage = null) => {
    if (isTyping) return;
    const outgoingText = actionMessage || draftText;
    if (!outgoingText.trim()) return;

    const newMsg = {
      id: Date.now(),
      who: "user",
      type: "text",
      text: outgoingText,
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraftText("");
    setIsTyping(true);

    try {
      const data = await apiClient.post("/api/chat", 
        { message: newMsg.text, action, useLearnerContext },
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
      console.error("Error calling API:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          who: "ai",
          type: "text",
          text: `Sorry, I couldn't process your request. ${errorMessage || 'Please try again.'}`,
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
          text: "Hello! I'm your English AI assistant. How can I help you today?",
        }
      ]);
      setConversationLength(0);
    } catch (err) {
      console.error("Error clearing chat:", err);
      setStatusMessage("The conversation could not be cleared. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-16 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Bot aria-hidden="true" className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-950 sm:text-lg">
              English AI Assistant
            </h1>
            <p className="text-xs text-gray-500">
              {conversationLength > 0 ? `${conversationLength} messages` : "Ready to help"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClearChat}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          title="Clear conversation"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" /> <span className="max-sm:hidden">Clear</span>
        </button>
      </header>

      {/* Chat area */}
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600">
              <Bot aria-hidden="true" className="h-4 w-4 text-white" />
            </div>
            <div className="max-w-[70%] rounded-2xl border border-slate-200 bg-white px-5 py-3">
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
            <div className="max-w-[85%] rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 sm:max-w-[70%]">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 italic">{draftText}</span>
                <button
                  onClick={() => setDraftText("")}
                  className="ml-2 text-red-500 hover:text-red-600 transition font-bold"
                  title="Clear draft"
                >
                  <X aria-label="Clear draft" className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-gray-500">Press Enter to send...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Controls */}
      <footer className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        {statusMessage && <p role="alert" className="mx-auto mb-2 max-w-4xl text-sm text-red-600">{statusMessage}</p>}
        <div className="mx-auto mb-3 flex max-w-4xl gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => handleSend('explain_mistake', 'Explain my most recent mistake.')} className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Explain a mistake</button>
          <button type="button" onClick={() => handleSend('another_example', 'Give me another IELTS example.')} className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Another example</button>
          <button type="button" onClick={() => handleSend('practice_topic', 'Create a short practice activity for my weakest skill.')} className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Practice weakness</button>
          <label className="ml-auto flex shrink-0 items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={useLearnerContext} onChange={event => setUseLearnerContext(event.target.checked)} /> Use my learning context</label>
        </div>
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          {/* Voice recording button */}
          <button
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              recording
                ? "bg-red-600 text-white focus-visible:ring-red-500"
                : "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500"
            }`}
            onClick={toggleRecording}
            title={recording ? "Stop recording" : "Start voice input"}
          >
            {recording ? <Square aria-hidden="true" className="h-4 w-4 fill-current" /> : <Mic aria-hidden="true" className="h-5 w-5" />}
          </button>

          {/* Text input */}
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message or use voice input..."
            aria-label="Message"
            className="min-h-11 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            rows="1"
            style={{ maxHeight: '100px' }}
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!draftText.trim()}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              draftText.trim()
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>Send</span>
              <Send aria-hidden="true" className="h-4 w-4" />
            </span>
          </button>
        </div>

        {/* Tips */}
        <div className="text-center mt-2 text-xs text-gray-500">
          Press Enter to send, or use voice input for speaking practice.
        </div>
      </footer>
    </div>
  );
}
