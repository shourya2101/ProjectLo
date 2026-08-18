"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, User, CheckCircle2 } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerAvatar?: string;
  projectTitle?: string;
}

export function ChatModal({ isOpen, onClose, sellerName, sellerAvatar, projectTitle }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: sellerName, text: `Hi! Thanks for reaching out about ${projectTitle || "my project"}. How can I help?`, time: "Just now" }
  ]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "You",
      text: message.trim(),
      time: "Just now"
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    // Simulate seller auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: sellerName,
          text: "Thanks for the message! I've received your note and will get back to you shortly.",
          time: "Just now"
        }
      ]);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <img 
              src={sellerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=6366f1&color=fff`} 
              alt={sellerName}
              className="h-10 w-10 rounded-full ring-2 ring-indigo-500/40"
            />
            <div>
              <h2 id="chat-modal-title" className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                {sellerName}
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                Re: {projectTitle || "Project Query"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors btn-anim"
            aria-label="Close chat dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[260px] bg-slate-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === "You"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${sellerName}...`}
            className="flex-1 bg-slate-800 border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors btn-anim active:scale-95 shadow-md shadow-indigo-600/30"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
