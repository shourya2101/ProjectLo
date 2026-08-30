"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SellerDashboardPage() {
  const { user, session, role, isSeller, isAdmin, isSuspended, dbUser } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    rejectedListings: 0,
    completedDeals: 0,
  });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    // Fetch seller stats
    fetch("/api/products/seller/stats", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalListings === "number") {
          setStats(data);
        }
      })
      .catch(console.error);

    // Fetch seller's listings
    fetch("/api/products/my", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentListings(data.slice(0, 5));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [session]);

  if (!isSeller && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Seller Verification Required</h1>
        <p className="text-sm text-slate-400">
          You need an approved seller account to access the Seller Dashboard.
        </p>
        <Link
          href="/become-seller"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim"
        >
          Apply to Become a Seller <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Seller Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Seller
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Overview of your project listings, moderation queue status, and deals.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Listing
        </Link>
      </div>

      {/* Suspension Alert if applicable */}
      {isSuspended && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-2xl shadow-xl">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-red-300">Selling Privileges Suspended</h2>
            <p className="text-xs text-red-200 leading-relaxed">
              {dbUser?.suspendedReason || "Your selling privileges have been temporarily deactivated by platform moderation. You cannot publish or edit listings at this time."}
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Listings</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stats.totalListings}</p>
          <p className="text-[11px] text-slate-500">All created projects</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.approvedListings}</p>
          <p className="text-[11px] text-slate-500">Live in marketplace</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.pendingListings}</p>
          <p className="text-[11px] text-slate-500">In moderation queue</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Rejected</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-400">{stats.rejectedListings}</p>
          <p className="text-[11px] text-slate-500">Needs revision</p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Deals Completed</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stats.completedDeals}</p>
          <p className="text-[11px] text-slate-500">Finished orders</p>
        </div>
      </div>

      {/* Moderation Workflow Explanation */}
      <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Listing Moderation Process</span>
          </div>
          <p className="text-xs text-slate-300">
            Every new project listing is reviewed by administrators before appearing publicly to verify documentation quality and prevent academic duplicates.
          </p>
        </div>
        <Link
          href="/my-listings"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 whitespace-nowrap flex items-center gap-1"
        >
          View all listings <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Recent Listings</h2>
          <Link href="/my-listings" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            Manage All
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading listings...</div>
          ) : recentListings.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Package className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm">You haven't listed any projects yet.</p>
              <Link
                href="/sell"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Create your first listing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentListings.map((item) => (
                <div key={item.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title.substring(0, 2))}&background=1e293b&color=fff&size=100`}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                      <p className="text-xs text-slate-400">{item.category} • {item.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-bold text-slate-100">
                      {item.type === 'RENT'
                        ? `₹${(item.priceRentPaise / 100).toFixed(2)}/day`
                        : `₹${(item.priceSalePaise / 100).toFixed(2)}`}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : item.status === 'PENDING_REVIEW'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {item.status === 'PENDING_REVIEW' ? 'Pending Review' : item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
