import { Bot, Check, Copy, UserRound } from "lucide-react";
import { useState } from "react";

export default function MessageBubble({ msg }) {
  const isUser = msg.who === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.text || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className={`group flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-slate-700" : "bg-brand-600"}`}>
        {isUser ? <UserRound aria-hidden="true" className="h-4 w-4 text-white" /> : <Bot aria-hidden="true" className="h-4 w-4 text-white" />}
      </div>
      <div className={`flex max-w-[85%] flex-col sm:max-w-[72%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-6 sm:text-base ${isUser ? "rounded-tr-sm bg-brand-600 text-white" : "rounded-tl-sm border border-slate-200 bg-white text-slate-800"}`}>
          {Array.isArray(msg.paragraphs)
            ? msg.paragraphs.map((paragraph, index) => <p key={index} className="mb-2 last:mb-0">{paragraph}</p>)
            : <p className="whitespace-pre-wrap">{msg.text}</p>}
        </div>
        <div className="mt-1 flex min-h-7 items-center gap-2 px-1 text-xs text-slate-400">
          <time>{new Date(msg.id).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</time>
          {!isUser && (
            <button type="button" onClick={handleCopy} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-slate-500 opacity-100 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
