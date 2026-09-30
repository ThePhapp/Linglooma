import React, { useState } from "react";

export default function MessageBubble({ msg }) {
  const isUser = msg.who === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatText = (text) => {
    if (!text) return "";
    
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-purple-600">$1</code>');
    
    text = text.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>');
    
    return text;
  };

  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div
          className={`px-5 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
            isUser
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
          }`}
        >
          {msg.type === 'text' && Array.isArray(msg.paragraphs) ? (
            msg.paragraphs.map((p, i) => (
              <p key={i} className="mb-2 last:mb-0">
                {p}
              </p>
            ))
          ) : (
            <div 
              className="whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
            />
          )}
        </div>

        {/* Actions (copy button for AI messages) */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className={`text-xs px-2 py-1 rounded-md transition-colors duration-200 ${
                copied 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Copy message"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-1 px-1">
          {new Date(msg.id).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
