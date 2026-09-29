"use client";

import Link from "next/link";
import { useState, use, useEffect } from "react";
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
  MessageSquare,
  Clock,
  AlertCircle
} from "lucide-react";
import { ChatModal } from "@/components/chat/ChatModal";
import { useAuth } from "@/lib/auth-context";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { session, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"sale" | "rent">("sale");
  const [copied, setCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    fetch(`/api/products/${resolvedParams.id}`, { headers })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Failed to fetch: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setProduct(data);
        if (data.type === 'RENT') {
          setSelectedTab('rent');
        } else {
          setSelectedTab('sale');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [resolvedParams.id, session]);

  if (loading) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-slate-400">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Listing Not Available</h1>
        <p className="text-sm text-slate-400">
          {error || "This listing may be pending moderation or does not exist."}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerifiedSeller = product.seller?.role === "SELLER" || product.seller?.role === "ADMIN";
  const isOwner = Boolean(user?.id && product?.sellerId && user.id === product.sellerId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-slate-100">
      
      {/* Moderation status banner if not approved */}
      {product.status !== "APPROVED" && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
          product.status === "PENDING_REVIEW"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          <div className="flex items-center gap-2.5">
            {product.status === "PENDING_REVIEW" ? (
              <Clock className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <div>
              <span className="font-bold uppercase tracking-wider block">
                {product.status === "PENDING_REVIEW" ? "Moderation Status: Pending Review" : "Moderation Status: Rejected"}
              </span>
              <span>
                {product.status === "PENDING_REVIEW"
                  ? "This listing is currently in the review queue and is only visible to you and platform administrators."
                  : `Feedback: ${product.rejectionReason || "Listing does not meet moderation standards."}`}
              </span>
            </div>
          </div>
        </div>
      )}

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
              <span>{product.category}</span>
              {product.subcategory && (
                <>
                  <span>•</span>
                  <span>{product.subcategory}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
              {product.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span className="font-bold text-slate-100">{product.rating}</span>
                <span>({product.reviewCount} reviews)</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="h-4 w-4" /> Posted {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Project Preview Banner */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden relative aspect-video flex items-center justify-center shadow-2xl">
            <img 
              src={product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title.substring(0, 4))}&background=0b0f19&color=38bdf8&size=600`}
              alt="Project Preview"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Reviewed &amp; Approved</span>
                </div>
                <p className="text-sm font-semibold">Includes Complete Documentation, Source Code &amp; Specs</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Overview</h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Listing Info</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Inventory Type: {product.inventoryType}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Listing Type: {product.type}</span>
              </li>
            </ul>
          </div>

          {/* Seller Card */}
          <div className="rounded-3xl border border-slate-800 p-6 bg-slate-900/80 space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Author</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={product.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.name)}&background=6366f1&color=fff`} 
                  alt={product.seller.name} 
                  className="h-12 w-12 rounded-full ring-2 ring-indigo-500/50 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-base">{product.seller.name}</h3>
                    {isVerifiedSeller && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Seller
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{product.seller.institution || product.seller.department || 'Verified Student'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      {product.seller.rating || 5.0} rating
                    </span>
                    <span>•</span>
                    <span>{product.seller.completedDeals || 0} deals completed</span>
                  </div>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors btn-anim active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat with Seller
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Action Column */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            
            {/* Purchase Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl text-sm font-semibold text-slate-400 border border-slate-800">
              <button 
                onClick={() => setSelectedTab("sale")}
                className={`py-2 rounded-lg transition-all btn-anim ${
                  selectedTab === "sale" ? "bg-indigo-600 text-white shadow-md font-bold" : "hover:text-slate-200"
                } ${!product.priceSalePaise && product.type !== 'SALE' && product.type !== 'BOTH' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!product.priceSalePaise && product.type !== 'SALE' && product.type !== 'BOTH'}
              >
                Buy Outright
              </button>
              <button 
                onClick={() => setSelectedTab("rent")}
                className={`py-2 rounded-lg transition-all btn-anim ${
                  selectedTab === "rent" ? "bg-indigo-600 text-white shadow-md font-bold" : "hover:text-slate-200"
                } ${!product.priceRentPaise && product.type !== 'RENT' && product.type !== 'BOTH' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!product.priceRentPaise && product.type !== 'RENT' && product.type !== 'BOTH'}
              >
                Rent Hardware
              </button>
            </div>

            {/* Price Display */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100">
                  {selectedTab === "sale" && product.priceSalePaise != null ? `₹${(product.priceSalePaise / 100).toFixed(2)}` : ''}
                  {selectedTab === "rent" && product.priceRentPaise != null ? `₹${(product.priceRentPaise / 100).toFixed(2)}` : ''}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedTab === "sale" ? "Full project license" : "Rental per day"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Instant digital delivery upon payment confirmation.</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isOwner ? (
                <Link
                  href="/my-listings"
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-sm border border-slate-700 shadow-md transition-all btn-anim flex items-center justify-center gap-2 text-center"
                >
                  Manage in My Listings
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all btn-anim active:scale-95 flex items-center justify-center gap-2"
                  >
                    {selectedTab === "sale" ? (
                      <>
                        <Download className="h-4 w-4" />
                        Purchase &amp; Contact Seller
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Rent &amp; Contact Seller
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
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Reviewed &amp; Approved by ProjectLo Moderation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Includes complete documentation & report template</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Direct peer-to-peer messaging with verified seller</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Accessible Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sellerName={product.seller.name}
        sellerAvatar={product.seller.avatar}
        projectTitle={product.title}
        productId={product.id}
      />

    </div>
  );
}
