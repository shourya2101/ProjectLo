"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle, ArrowUpRight, CheckCircle2, ShieldCheck, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface RentalItem {
  id: string;
  startDate: string;
  endDate: string;
  dailyRatePaise: number;
  totalPaidPaise: number;
  securityDepositPaise?: number | null;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  createdAt: string;
  product: {
    id: string;
    title: string;
    category: string;
    image?: string | null;
    seller?: {
      id: string;
      name: string;
      avatar?: string | null;
      institution?: string | null;
    };
  };
}

export default function RentalsPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/rentals", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load rentals");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRentals(data);
        } else {
          setRentals([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Rentals fetch error:", err);
        setRentals([]);
        setLoading(false);
      });
  }, [session]);

  const activeRentals = rentals.filter(
    (r) => r.status === "ACTIVE" || r.status === "PENDING"
  );
  const pastRentals = rentals.filter(
    (r) => r.status === "COMPLETED" || r.status === "CANCELLED" || r.status === "DISPUTED"
  );

  const calculateDaysRemaining = (endDateStr: string) => {
    const diff = new Date(endDateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 text-slate-100">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Hardware Rentals</h1>
        <p className="text-sm text-slate-400">
          Please log in to view and manage your active hardware and lab equipment rentals.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Hardware Rentals</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track active lab hardware, dev kits, and equipment rentals from your peers.
          </p>
        </div>
        <Link
          href="/products?type=RENT"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim self-start sm:self-auto"
        >
          <Package className="w-4 h-4" />
          Rent Equipment
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading rentals from database...</span>
        </div>
      ) : (
        <>
          {/* Active Rentals Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Active Rentals ({activeRentals.length})
            </h2>

            {activeRentals.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-3">
                <p className="text-sm text-slate-400">No active hardware rentals in your account.</p>
                <Link
                  href="/products?type=RENT"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Browse available dev kits &amp; lab hardware to rent <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeRentals.map((rental) => {
                  const daysLeft = calculateDaysRemaining(rental.endDate);
                  return (
                    <div
                      key={rental.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              daysLeft <= 1
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {daysLeft <= 1 && <AlertCircle className="h-3 w-3" />}
                            {rental.status} ({daysLeft} days left)
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            ₹{(rental.dailyRatePaise / 100).toFixed(2)}/day
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 leading-snug">
                          {rental.product?.title || "Hardware Rental Item"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Owner:{" "}
                          <span className="font-semibold text-slate-200">
                            {rental.product?.seller?.name || "Verified Student"}
                          </span>
                        </p>
                      </div>

                      {/* Rental Timeline */}
                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>Start: {new Date(rental.startDate).toLocaleDateString()}</span>
                        </div>
                        <span>→</span>
                        <div>
                          <span>
                            Return:{" "}
                            <strong className="text-slate-100">
                              {new Date(rental.endDate).toLocaleDateString()}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <span className="text-sm font-bold text-slate-100">
                          Total: ₹{(rental.totalPaidPaise / 100).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/messages"
                            className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors btn-anim active:scale-95"
                            title="Message owner"
                          >
                            Message Owner
                          </Link>
                          {rental.product?.id && (
                            <Link
                              href={`/products/${rental.product.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors btn-anim active:scale-95 shadow-md shadow-indigo-600/30"
                            >
                              Details <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Past Rentals Section */}
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-500" />
              Past Rentals History ({pastRentals.length})
            </h2>

            {pastRentals.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
                <p className="text-sm text-slate-400">No past hardware rental history found.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-800">
                  {pastRentals.map((rental) => (
                    <div
                      key={rental.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">
                          {rental.product?.title || "Hardware Rental"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Rented from {rental.product?.seller?.name || "Verified Student"} • Ended on{" "}
                          {new Date(rental.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-100">
                          ₹{(rental.totalPaidPaise / 100).toFixed(2)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {rental.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
