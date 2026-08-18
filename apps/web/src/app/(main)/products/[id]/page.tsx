"use client";

import Link from "next/link";
import { useState, use } from "react";
import { 
  Star, 
  ShieldCheck, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  Bookmark,
  MessageSquare
} from "lucide-react";
import { ChatModal } from "@/components/chat/ChatModal";

const MOCK_PRODUCT = {
  id: "1",
  title: "Autonomous Drone CV Engine & ROS2 Controller",
  category: "Computer Science",
  subcategory: "Robotics & Vision",
  type: "Sale & Rent",
  priceSale: "₹1,200",
  priceRent: "₹150/day",
  rating: 4.9,
  reviewCount: 28,
  salesCount: 45,
  updatedAt: "August 2026",
  description: "Complete senior design project featuring real-time computer vision obstacle detection and ROS2 integration for autonomous multirotor flight controller.",
  specs: [
    { label: "Language", value: "C++ / Python 3.10" },
    { label: "Framework", value: "ROS2 Humble / OpenCV 4.8" },
    { label: "Hardware Req.", value: "Nvidia Jetson / Raspberry Pi 4" },
    { label: "Documentation", value: "Full IEEE Format Report & Setup Guide" },
    { label: "License", value: "Academic Re-use License" },
  ],
  features: [
    "YOLO-based object detection tuned for low latency",
    "PX4 autopilot integration over MAVLink",
    "Gazebo simulation environment included",
    "Step-by-step video demonstration and setup checklist"
  ],
  seller: {
    name: "Alex Miller",
    department: "Computer Engineering, Senior Year",
    rating: 4.9,
    completedDeals: 45,
    joinedDate: "Jan 2025",
    avatar: "https://ui-avatars.com/api/?name=Alex+Miller&background=6366f1&color=fff"
  }
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [selectedTab, setSelectedTab] = useState<"sale" | "rent">("sale");
  const [copied, setCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-slate-100">
      {/* Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors btn-anim"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors btn-anim active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Share"}
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors btn-anim active:scale-95">
            <Bookmark className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details, Right Purchase Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              <span>{MOCK_PRODUCT.category}</span>
              <span>•</span>
              <span>{MOCK_PRODUCT.subcategory}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
              {MOCK_PRODUCT.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span className="font-bold text-slate-100">{MOCK_PRODUCT.rating}</span>
                <span>({MOCK_PRODUCT.reviewCount} reviews)</span>
              </div>
              <span>•</span>
              <span>{MOCK_PRODUCT.salesCount} purchases</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="h-4 w-4" /> Updated {MOCK_PRODUCT.updatedAt}
              </span>
            </div>
          </div>

          {/* Project Preview Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative aspect-video flex items-center justify-center shadow-2xl">
            <img 
              src={`https://ui-avatars.com/api/?name=ROS2+Vision&background=0b0f19&color=38bdf8&size=600`}
              alt="Project Preview"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Verified Peer Codebase</p>
                <p className="text-sm font-semibold">Includes Source Code, CAD Files & Documentation</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Overview</h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {MOCK_PRODUCT.description}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Key Highlights</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_PRODUCT.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Specs */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Technical Specifications</h2>
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
              <dl className="divide-y divide-slate-800">
                {MOCK_PRODUCT.specs.map((spec, idx) => (
                  <div key={idx} className="px-4 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4 odd:bg-slate-900/50">
                    <dt className="text-sm font-semibold text-slate-400">{spec.label}</dt>
                    <dd className="mt-1 text-sm font-bold text-slate-100 sm:col-span-2 sm:mt-0">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Seller Card */}
          <div className="rounded-2xl border border-slate-800 p-6 bg-slate-900/80 space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Author</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={MOCK_PRODUCT.seller.avatar} 
                  alt={MOCK_PRODUCT.seller.name} 
                  className="h-12 w-12 rounded-full ring-2 ring-indigo-500/50"
                />
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{MOCK_PRODUCT.seller.name}</h3>
                  <p className="text-xs text-slate-400">{MOCK_PRODUCT.seller.department}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      {MOCK_PRODUCT.seller.rating} rating
                    </span>
                    <span>•</span>
                    <span>{MOCK_PRODUCT.seller.completedDeals} deals completed</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors btn-anim active:scale-95"
              >
                <MessageSquare className="h-4 w-4" />
                Chat with Seller
              </button>
            </div>
          </div>

        </div>

        {/* Right Action Column */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            
            {/* Purchase Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl text-sm font-semibold text-slate-400 border border-slate-800">
              <button 
                onClick={() => setSelectedTab("sale")}
                className={`py-2 rounded-lg transition-all btn-anim ${
                  selectedTab === "sale" ? "bg-indigo-600 text-white shadow-md font-bold" : "hover:text-slate-200"
                }`}
              >
                Buy Outright
              </button>
              <button 
                onClick={() => setSelectedTab("rent")}
                className={`py-2 rounded-lg transition-all btn-anim ${
                  selectedTab === "rent" ? "bg-indigo-600 text-white shadow-md font-bold" : "hover:text-slate-200"
                }`}
              >
                Rent Hardware
              </button>
            </div>

            {/* Price Display */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100">
                  {selectedTab === "sale" ? MOCK_PRODUCT.priceSale : MOCK_PRODUCT.priceRent}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedTab === "sale" ? "Full project license" : "Rental per day"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Instant digital delivery upon payment confirmation.</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all btn-anim active:scale-95 flex items-center justify-center gap-2"
              >
                {selectedTab === "sale" ? (
                  <>
                    <Download className="h-4 w-4" />
                    Purchase & Download Now
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Select Rental Dates
                  </>
                )}
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors btn-anim active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                Ask Seller a Question
              </button>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Verified Peer Code & Anti-Plagiarism Check</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Includes complete documentation & report template</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Direct peer-to-peer messaging with seller</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Accessible Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sellerName={MOCK_PRODUCT.seller.name}
        sellerAvatar={MOCK_PRODUCT.seller.avatar}
        projectTitle={MOCK_PRODUCT.title}
      />

    </div>
  );
}
