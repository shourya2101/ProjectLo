"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Package, 
  AlertCircle,
  ExternalLink,
  Loader2,
  Filter,
  Check,
  X,
  AlertTriangle,
  UserX,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type AdminTab = "applications" | "products" | "sellers";

export default function AdminDashboardPage() {
  const { session, isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");

  const [stats, setStats] = useState({
    pendingApplications: 0,
    approvedSellers: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
    totalUsers: 0,
  });

  const [applications, setApplications] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState<{
    type: "application" | "product";
    id: string;
    title: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Suspension modal state
  const [suspendModal, setSuspendModal] = useState<{
    id: string;
    name: string;
    isSuspended: boolean;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const fetchAdminData = async () => {
    if (!session?.access_token) return;
    setLoading(true);

    try {
      // 1. Fetch stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch applications
      const appsRes = await fetch("/api/admin/applications", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      // 3. Fetch products
      const prodsRes = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (prodsRes.ok) {
        const prodsData = await prodsRes.json();
        setProducts(prodsData);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && isAdmin) {
      fetchAdminData();
    }
  }, [session, isAdmin]);

  if (authLoading) {
    return <div className="max-w-6xl mx-auto py-16 text-center text-slate-500">Loading admin portal...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Access Restricted</h1>
        <p className="text-sm text-slate-400">
          This portal is strictly restricted to ProjectLo platform administrators.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Handle Application Approval
  const handleApproveApplication = async (id: string) => {
    if (!session) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "APPROVE" })
      });
      if (res.ok) {
        await fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || "Approval failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Application Rejection
  const handleRejectApplicationSubmit = async () => {
    if (!session || !rejectModal) return;
    setActionLoadingId(rejectModal.id);
    try {
      const endpoint = rejectModal.type === "application"
        ? `/api/admin/applications/${rejectModal.id}/review`
        : `/api/admin/products/${rejectModal.id}/review`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason: rejectionReason || "Did not meet platform verification guidelines."
        })
      });

      if (res.ok) {
        setRejectModal(null);
        setRejectionReason("");
        await fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Product Approval
  const handleApproveProduct = async (id: string) => {
    if (!session) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "APPROVE" })
      });
      if (res.ok) {
        await fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || "Approval failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Seller Suspension
  const handleSuspendSellerSubmit = async () => {
    if (!session || !suspendModal) return;
    setActionLoadingId(suspendModal.id);
    try {
      const res = await fetch(`/api/admin/sellers/${suspendModal.id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          isSuspended: !suspendModal.isSuspended,
          reason: suspendReason || undefined
        })
      });

      if (res.ok) {
        setSuspendModal(null);
        setSuspendReason("");
        await fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || "Suspension update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 text-slate-100 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Admin Moderation Center</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Platform Admin
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Review student seller applications, moderate project listings, and manage seller standing.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all btn-anim"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Refresh Data
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pending Sellers</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{stats.pendingApplications}</p>
          <p className="text-[11px] text-slate-500">Awaiting verification</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pending Listings</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-400">{stats.pendingListings}</p>
          <p className="text-[11px] text-slate-500">Awaiting moderation</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Verified Sellers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{stats.approvedSellers}</p>
          <p className="text-[11px] text-slate-500">Active approved sellers</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Live Listings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{stats.approvedListings}</p>
          <p className="text-[11px] text-slate-500">Approved in market</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-extrabold text-red-400">{stats.rejectedListings}</p>
          <p className="text-[11px] text-slate-500">Rejected listings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "applications"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Seller Applications ({applications.filter(a => a.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "products"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Project Listings ({products.filter(p => p.status === 'PENDING_REVIEW').length})
        </button>
        <button
          onClick={() => setActiveTab("sellers")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "sellers"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Sellers Standing
        </button>
      </div>

      {/* Tab Content 1: Seller Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">
              Seller Applications Queue ({applications.length})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              No seller applications submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const isPending = app.status === "PENDING";
                const isProcessing = actionLoadingId === app.id;

                return (
                  <div
                    key={app.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                          {app.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-100">{app.fullName}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              app.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : app.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{app.institution} • Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Action buttons for pending application */}
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all btn-anim disabled:opacity-50"
                          >
                            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve Seller
                          </button>

                          <button
                            onClick={() => setRejectModal({ type: "application", id: app.id, title: `Reject ${app.fullName}` })}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all btn-anim disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">
                          Reviewed: {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block font-medium">Contact & Credentials</span>
                        <p className="text-slate-200">Email: <span className="font-semibold">{app.email}</span></p>
                        <p className="text-slate-200">Phone: <span className="font-semibold">{app.phone}</span></p>
                        {app.studentProof && (
                          <p className="text-indigo-400 pt-1 flex items-center gap-1">
                            <span>Proof Link:</span>
                            <a href={app.studentProof} target="_blank" rel="noreferrer" className="underline truncate max-w-[200px]">
                              {app.studentProof}
                            </a>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block font-medium">Seller Background & Intent</span>
                        <p className="text-slate-300 italic line-clamp-2">"{app.about}"</p>
                        <p className="text-slate-300 pt-1"><strong>Plans to sell:</strong> {app.reason}</p>
                      </div>
                    </div>

                    {app.rejectionReason && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                        <strong>Rejection Feedback:</strong> {app.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Project Listings Moderation */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">
              Project Listings Moderation ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
              No listings in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.map((product) => {
                const isPending = product.status === "PENDING_REVIEW";
                const isProcessing = actionLoadingId === product.id;

                return (
                  <div
                    key={product.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col lg:flex-row gap-6"
                  >
                    {/* Thumbnail */}
                    <div className="w-full lg:w-60 h-44 rounded-2xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-800">
                      <img
                        src={product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title.substring(0, 2))}&background=1e293b&color=fff&size=300`}
                        alt={product.title}
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          product.status === 'APPROVED'
                            ? 'bg-emerald-500/80 text-white'
                            : product.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/80 text-white'
                              : 'bg-red-500/80 text-white'
                        }`}>
                          {product.status === 'PENDING_REVIEW' ? 'PENDING' : product.status}
                        </span>
                      </div>
                    </div>

                    {/* Listing Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-0.5">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span>{product.type}</span>
                            <span>•</span>
                            <span>{product.inventoryType}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-100 leading-snug">{product.title}</h3>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-extrabold text-slate-100">
                            {product.type === 'RENT'
                              ? `₹${(product.priceRentPaise / 100).toFixed(2)}/day`
                              : `₹${(product.priceSalePaise / 100).toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Seller info & Review Actions */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 text-xs text-slate-400">
                          <span className="text-slate-500">Seller:</span>
                          <span className="font-semibold text-slate-200">{product.seller?.name}</span>
                          <span>•</span>
                          <span className="text-slate-400">{product.seller?.institution || "Verified Student"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors btn-anim"
                          >
                            Preview Listing
                          </Link>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveProduct(product.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all btn-anim disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Approve
                              </button>

                              <button
                                onClick={() => setRejectModal({ type: "product", id: product.id, title: `Reject "${product.title}"` })}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all btn-anim disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {product.rejectionReason && (
                        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                          <strong>Rejection Reason:</strong> {product.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Seller Standing / Suspension */}
      {activeTab === "sellers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">
              Verified Sellers & Account Standing
            </h2>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {applications.filter(a => a.status === 'APPROVED').length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No approved sellers registered yet.</div>
              ) : (
                applications
                  .filter(a => a.status === 'APPROVED')
                  .map((app) => {
                    const sellerUser = app.user;
                    const isSuspended = sellerUser?.isSuspended;

                    return (
                      <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={sellerUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerUser?.name || 'Seller')}&background=6366f1&color=fff`}
                            alt={sellerUser?.name || 'Seller'}
                            className="w-11 h-11 rounded-full ring-2 ring-indigo-500/40 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-100">{sellerUser?.name}</h3>
                              {isSuspended ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                  SUSPENDED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  ACTIVE SELLER
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{sellerUser?.email} • {sellerUser?.institution || app.institution}</p>
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => setSuspendModal({ id: sellerUser.id, name: sellerUser.name, isSuspended: !!isSuspended })}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all btn-anim ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {isSuspended ? (
                              <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Unsuspend Seller</span>
                            ) : (
                              <span className="flex items-center gap-1.5"><UserX className="w-3.5 h-3.5" /> Suspend Privileges</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rejection Reason */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">{rejectModal.title}</h3>
              <button onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Rejection Reason (Feedback for Seller) *
              </label>
              <textarea
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 transition-all"
                placeholder="e.g. Project information is incomplete or requires verification of code ownership."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRejectApplicationSubmit}
                disabled={actionLoadingId !== null}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all btn-anim disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Seller Suspension */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                {suspendModal.isSuspended ? `Unsuspend ${suspendModal.name}` : `Suspend ${suspendModal.name}`}
              </h3>
              <button onClick={() => setSuspendModal(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!suspendModal.isSuspended && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Suspension Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. Violation of project authenticity guidelines or reported dispute."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
            )}

            <p className="text-xs text-slate-400 leading-relaxed">
              {suspendModal.isSuspended
                ? "This will restore the user's active selling privileges and allow them to create and manage listings."
                : "This will deactivate the user's ability to create, edit, or list new projects without deleting their past account history."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSuspendSellerSubmit}
                disabled={actionLoadingId !== null}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition-all btn-anim disabled:opacity-50 ${
                  suspendModal.isSuspended
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                    : "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                }`}
              >
                {suspendModal.isSuspended ? "Confirm Unsuspension" : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
