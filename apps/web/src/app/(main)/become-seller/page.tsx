"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  BookOpen,
  Send
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, dbUser, role, isSeller, isAdmin, activeApplication, session, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: dbUser?.name || user?.user_metadata?.name || "",
    email: dbUser?.email || user?.email || "",
    phone: "",
    institution: dbUser?.institution || "",
    about: "",
    reason: "",
    studentProof: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showReapplyForm, setShowReapplyForm] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Sign in to Become a Seller</h1>
        <p className="text-sm text-slate-400">
          Create an account or sign in to submit your verification application.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim"
        >
          Sign In / Sign Up
        </Link>
      </div>
    );
  }

  // If already a seller or admin
  if (isSeller || isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-100">You Are a Verified {role === 'ADMIN' ? 'Admin' : 'Seller'}!</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your account is approved to publish project codebases, list lab hardware for rental, and manage peer listings.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/seller"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim"
          >
            Seller Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all btn-anim"
          >
            Create New Listing
          </Link>
        </div>
      </div>
    );
  }

  // If application is pending review
  if (activeApplication?.status === "PENDING" || success) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6">
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 animate-pulse" />
          
          <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
            <Clock className="w-10 h-10 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Application Under Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 pt-2">
              Your Application is Being Reviewed
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Our moderation team reviews student credentials and institutional details to maintain marketplace credibility. Reviews typically take less than 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2 text-slate-400 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-semibold text-slate-200">{formData.fullName || dbUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">College / Institute:</span>
              <span className="font-semibold text-slate-200">{formData.institution || dbUser?.institution || "Provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted:</span>
              <span className="font-semibold text-slate-200">
                {activeApplication?.createdAt ? new Date(activeApplication.createdAt).toLocaleDateString() : "Just now"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If application was rejected and user hasn't toggled reapply form
  if (activeApplication?.status === "REJECTED" && !showReapplyForm) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6">
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              Application Needs Revision
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 pt-2">
              Previous Application Not Approved
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              The moderation team was unable to approve your previous submission. Please review the feedback below and submit updated details.
            </p>
          </div>

          {activeApplication.rejectionReason && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left max-w-md mx-auto">
              <p className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">Feedback from Admin</p>
              <p className="text-sm text-red-200">{activeApplication.rejectionReason}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => setShowReapplyForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim"
            >
              Re-apply with Updated Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!session?.access_token) {
        setError("You must be logged in to submit an application.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/seller-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to submit application. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      await refreshProfile();
    } catch (err: any) {
      setError(err?.message || "A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 text-slate-100 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 p-8 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ProjectLo Seller Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Apply to Become a Verified Seller
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Sell senior design codebases, rent out microcontrollers &amp; robotic dev kits, and build academic credibility across universities.
          </p>
        </div>
      </div>

      {/* Trust points */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Badge</span>
          </div>
          <p className="text-xs text-slate-400">Earn the "Verified Seller" badge on all your listings and profile.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Direct P2P Deals</span>
          </div>
          <p className="text-xs text-slate-400">Chat with college buyers, set rental prices, and accept requests.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Quality Moderation</span>
          </div>
          <p className="text-xs text-slate-400">Admin review ensures verified, anti-plagiarism projects only.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
          Applicant Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Legal Name *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Alex Miller"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">College / Institution *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Stanford University / IIT Delhi"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Academic / Contact Email *</label>
            <input
              required
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. alex@student.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Phone / WhatsApp Number *</label>
            <input
              required
              type="tel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Short Bio / Background *</label>
          <textarea
            required
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="Tell us about your academic major, engineering interests, or past hardware/software projects..."
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">What Do You Plan to Sell or Rent on ProjectLo? *</label>
          <textarea
            required
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="e.g. My senior design capstone project, ESP32 IoT sensors, Raspberry Pi dev kits..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Student ID / LinkedIn / Portfolio Proof (Optional)</label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="e.g. https://linkedin.com/in/username or institutional ID link"
            value={formData.studentProof}
            onChange={(e) => setFormData({ ...formData, studentProof: e.target.value })}
          />
          <p className="text-[11px] text-slate-500">
            Helps administrators expedite verification without requesting manual documents.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all btn-anim disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Seller Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
