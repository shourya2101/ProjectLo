"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerAvatar?: string;
  projectTitle?: string;
  productId?: string;
}

export function ChatModal({ isOpen, onClose, sellerName, sellerAvatar, projectTitle, productId }: ChatModalProps) {
  const { session, user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<{ id: string | number, sender: string, text: string, time: string, isSystem?: boolean }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

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

      // Fetch existing conversation if authenticated
      if (session && productId) {
        setIsInitializing(true);
        setInitError(null);

        fetch("/api/conversations", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load conversations (${res.status})`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) return [];
          const conv = data.find((c: any) => c.productId === productId);
          if (conv) {
            setConversationId(conv.id);
            return fetch(`/api/conversations/${conv.id}/messages`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
            }).then(res => {
              if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
              return res.json();
            });
          }
          return [];
        })
        .then(msgs => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            setMessages(msgs.map((m: any) => ({
              id: m.id,
              sender: m.senderId === user?.id ? "You" : sellerName,
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
          } else {
            setMessages([]);
          }
        })
        .catch(err => {
          console.error("Error fetching conversation", err);
          setInitError(err.message || "Could not load conversation. Please try again.");
          setMessages([]);
        })
        .finally(() => setIsInitializing(false));
      } else if (!session) {
        // Not authenticated
        setInitError("Please log in to message this seller.");
        setMessages([]);
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        previousActiveElement.current?.focus();
        setInitError(null);
        setIsInitializing(false);
      };
    }
  }, [isOpen, session, productId, sellerName, projectTitle, user?.id, onClose]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    if (!session || !productId) {
      alert("Please sign in to send messages.");
      return;
    }

    const msgContent = message.trim();
    setMessage("");

    const tempId = Date.now();
    setMessages((prev) => [...prev, {
      id: tempId,
      sender: "You",
      text: msgContent,
      time: "Sending..."
    }]);

    setIsSending(true);
    try {
      let currentConvId = conversationId;
      
      // 1. Get or create conversation if we don't have it
      if (!currentConvId) {
        const convRes = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ productId })
        });
        
        if (!convRes.ok) {
          const errorData = await convRes.json().catch(() => ({}));
          console.error("Conversation creation failed", {
              status: convRes.status,
              error: errorData
          });
          throw new Error(errorData.error || errorData.message || "Unable to start conversation");
        }
        const conversation = await convRes.json();
        currentConvId = conversation.id;
        setConversationId(conversation.id);
      }

      // 2. Send message
      const msgRes = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          conversationId: currentConvId,
          content: msgContent
        })
      });

      if (!msgRes.ok) {
        const errorData = await msgRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to send message");
      }
      
      const savedMsg = await msgRes.json();
      
      // Successfully sent message, update time
      setMessages((prev) => prev.map(m => m.id === tempId ? {
        ...m,
        id: savedMsg.id,
        time: new Date(savedMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : m));
      
      window.dispatchEvent(new Event('conversation-created'));
      
    } catch (error: any) {
      console.error("Failed to send message via API:", error);
      alert(error.message || "Failed to send message. Please try again.");
      // Remove the optimistically added message
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
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

        {initError && (
          <p className="text-xs text-red-400 text-center px-4 py-2 bg-red-500/5">
            {initError}
          </p>
        )}
        
        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${sellerName}...`}
            disabled={isSending || isInitializing}
            className="flex-1 bg-slate-800 border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending || isInitializing}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors btn-anim active:scale-95 shadow-md shadow-indigo-600/30 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
