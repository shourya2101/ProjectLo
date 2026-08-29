"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Send, Search, CheckCircle2, User, FileCode, Paperclip, MoreVertical, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function MessagesPage() {
  const { session, user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConv) {
          setActiveConv(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (session && pathname === '/messages') {
      setIsLoadingConversations(true);
      fetchConversations();
    }
  }, [session, pathname]);

  useEffect(() => {
    const refresh = () => {
      if (session) {
        setIsLoadingConversations(true);
        fetchConversations();
      }
    };
    window.addEventListener('conversation-created', refresh);
    return () => window.removeEventListener('conversation-created', refresh);
  }, [session]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!session || !activeConv) return;
    
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${activeConv.id}/messages`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [activeConv?.id, session]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !session || isSending) return;

    const content = inputText.trim();
    setInputText("");
    setIsSending(true);
    setSendError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          conversationId: activeConv.id,
          content
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      
      // Update local conversation lastMessage preview
      setConversations((prev) => 
        prev.map(c => c.id === activeConv.id ? { ...c, messages: [newMsg], updatedAt: new Date().toISOString() } : c)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );

    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!activeConv || !session) return;
    const confirm = window.confirm("Are you sure you want to mark this order as complete?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/conversations/${activeConv.id}/complete-order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const { conversation } = await res.json();
        // Update local state
        setActiveConv((prev: any) => ({ ...prev, status: conversation.status }));
        setConversations((prev) => 
          prev.map(c => c.id === conversation.id ? { ...c, status: conversation.status } : c)
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to complete order");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  const filteredConversations = conversations.filter(c => {
    const partnerName = c.user1Id === user?.id ? "Buyer" : c.product?.seller?.name || "Seller";
    return partnerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (c.product?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-2xl border border-slate-800 bg-[#0d1322] overflow-hidden shadow-2xl">
      
      {/* Left Pane: Conversations List */}
      <div className="w-80 md:w-96 border-r border-slate-800 flex flex-col bg-[#0b0f19]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-100">Messages</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {isLoadingConversations ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-8 text-center text-slate-500 text-sm">No conversations found.</div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConv?.id === conv.id;
              // Determine if we are buyer or seller based on product owner
              const isSeller = conv.product?.seller?.id === user?.id;
              const partnerName = isSeller ? "Buyer" : conv.product?.seller?.name || "Seller";
              const partnerAvatar = isSeller 
                ? "https://ui-avatars.com/api/?name=Buyer&background=10b981&color=fff"
                : conv.product?.seller?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=6366f1&color=fff`;
              const lastMsg = conv.messages?.[0]?.content || "No messages yet";
              
              const date = new Date(conv.updatedAt);
              const timeString = date.toLocaleDateString() === new Date().toLocaleDateString() 
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString();

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors btn-anim ${
                    isActive ? "bg-indigo-600/15 border-l-4 border-indigo-500" : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={partnerAvatar} 
                      alt={partnerName} 
                      className="h-11 w-11 rounded-full ring-2 ring-slate-800"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-bold text-slate-100 truncate">{partnerName}</h2>
                      <span className="text-[11px] text-slate-500 shrink-0">{timeString}</span>
                    </div>

                    <p className="text-xs font-medium text-indigo-400 truncate mb-1">
                      {conv.product?.title || "Unknown Product"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {lastMsg}
                    </p>
                    {conv.status === 'COMPLETED' && (
                      <span className="inline-block mt-1 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Completed</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Window */}
      {activeConv ? (() => {
        const isSeller = activeConv.product?.seller?.id === user?.id;
        const partnerName = isSeller ? "Buyer" : activeConv.product?.seller?.name || "Seller";
        const partnerAvatar = isSeller 
          ? "https://ui-avatars.com/api/?name=Buyer&background=10b981&color=fff"
          : activeConv.product?.seller?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=6366f1&color=fff`;

        const isCompleted = activeConv.status === 'COMPLETED' || activeConv.status === 'CLOSED';

        return (
          <div className="flex-1 flex flex-col bg-[#0d1322]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-[#0b0f19] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={partnerAvatar} 
                  alt={partnerName} 
                  className="h-10 w-10 rounded-full ring-2 ring-indigo-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100">{partnerName}</h2>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                    Project: <span className="text-slate-200 font-medium">{activeConv.product?.title || "Unknown Product"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeConv.product?.id && (
                  <Link
                    href={`/products/${activeConv.product.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors btn-anim"
                  >
                    View Listing
                  </Link>
                )}
                {/* Complete Order Button */}
                {!isCompleted && activeConv.orderId && activeConv.order?.status !== 'COMPLETED' && (
                  <button
                    onClick={handleCompleteOrder}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-100 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors btn-anim"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
              {isLoadingMessages ? (
                <div className="text-center text-slate-500 text-sm mt-10">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm mt-10">No messages yet. Say hi!</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  const date = new Date(msg.createdAt);
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                            : "bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 px-1">{timeStr}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            {isCompleted ? (
              <div className="p-4 border-t border-slate-800 bg-[#0b0f19] flex justify-center text-sm text-slate-400 italic">
                This order is completed and the conversation is read-only.
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-[#0b0f19] flex flex-col gap-2">
                {sendError && <span className="text-red-400 text-xs px-2">{sendError}</span>}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors btn-anim"
                    title="Attach File"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Type a message...`}
                    disabled={isSending}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-all btn-anim active:scale-95 shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSending ? "Sending..." : "Send"}</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })() : (
        <div className="flex-1 flex flex-col bg-[#0d1322] items-center justify-center text-slate-500">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
