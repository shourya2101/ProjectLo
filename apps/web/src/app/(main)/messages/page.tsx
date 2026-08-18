"use client";

import { useState } from "react";
import { Send, Search, CheckCircle2, User, FileCode, Paperclip, MoreVertical, Star } from "lucide-react";
import Link from "next/link";

const MOCK_CONVERSATIONS = [
  {
    id: "c1",
    sellerName: "Alex Miller",
    avatar: "https://ui-avatars.com/api/?name=Alex+Miller&background=6366f1&color=fff",
    projectTitle: "Autonomous Drone CV Engine",
    lastMessage: "The Gazebo simulation config is included in the /sim directory!",
    time: "10:42 AM",
    unread: 1,
    online: true,
  },
  {
    id: "c2",
    sellerName: "Priya S.",
    avatar: "https://ui-avatars.com/api/?name=Priya+S&background=10b981&color=fff",
    projectTitle: "Nvidia Jetson Orin Nano Dev Kit",
    lastMessage: "I can ship the hardware kit by tomorrow morning.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "c3",
    sellerName: "David K.",
    avatar: "https://ui-avatars.com/api/?name=David+K&background=f59e0b&color=fff",
    projectTitle: "Financial Market Predictor ML Model",
    lastMessage: "Thanks for the feedback! Let me know if you need the PyTorch weights.",
    time: "Aug 08",
    unread: 0,
    online: true,
  }
];

const INITIAL_MESSAGES = [
  { id: 1, sender: "Alex Miller", text: "Hey! Let me know if you have any questions about the ROS2 setup for the Autonomous Drone project.", time: "10:30 AM" },
  { id: 2, sender: "You", text: "Hi Alex! Does the package include the Gazebo model configurations?", time: "10:38 AM" },
  { id: 3, sender: "Alex Miller", text: "Yes! The Gazebo simulation config is included in the /sim directory!", time: "10:42 AM" }
];

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "You",
      text: inputText.trim(),
      time: "Just now"
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate response from seller
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: activeConv.sellerName,
          text: "Got it! Let me check the repository and upload the updated launch scripts.",
          time: "Just now"
        }
      ]);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-2xl border border-slate-800 bg-[#0d1322] overflow-hidden shadow-2xl">
      
      {/* Left Pane: Conversations List */}
      <div className="w-80 md:w-96 border-r border-slate-800 flex flex-col bg-[#0b0f19]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-100">Seller Messages</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              3 Active
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {MOCK_CONVERSATIONS.map((conv) => {
            const isActive = activeConv.id === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConv(conv);
                }}
                className={`w-full p-4 flex items-start gap-3 text-left transition-colors btn-anim ${
                  isActive ? "bg-indigo-600/15 border-l-4 border-indigo-500" : "hover:bg-slate-800/40"
                }`}
              >
                <div className="relative shrink-0">
                  <img 
                    src={conv.avatar} 
                    alt={conv.sellerName} 
                    className="h-11 w-11 rounded-full ring-2 ring-slate-800"
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0b0f19]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-slate-100 truncate">{conv.sellerName}</h2>
                    <span className="text-[11px] text-slate-500 shrink-0">{conv.time}</span>
                  </div>

                  <p className="text-xs font-medium text-indigo-400 truncate mb-1">
                    {conv.projectTitle}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Right Pane: Active Chat Window */}
      <div className="flex-1 flex flex-col bg-[#0d1322]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-[#0b0f19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={activeConv.avatar} 
              alt={activeConv.sellerName} 
              className="h-10 w-10 rounded-full ring-2 ring-indigo-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{activeConv.sellerName}</h2>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                Project: <span className="text-slate-200 font-medium">{activeConv.projectTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products/1"
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors btn-anim"
            >
              View Listing
            </Link>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
          {messages.map((msg) => {
            const isMe = msg.sender === "You";
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                      : "bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-[#0b0f19] flex items-center gap-3">
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
            placeholder={`Type a message to ${activeConv.sellerName}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-all btn-anim active:scale-95 shadow-md shadow-indigo-600/30"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
