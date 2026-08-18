"use client";

import { Calendar, Clock, AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ACTIVE_RENTALS = [
  {
    id: "r1",
    title: "Nvidia Jetson Orin Nano Dev Kit 8GB",
    owner: "Priya S.",
    startDate: "Aug 10, 2026",
    endDate: "Aug 17, 2026",
    dailyRate: "₹200",
    totalPaid: "₹1,400",
    status: "Active",
    daysRemaining: 5,
  },
  {
    id: "r2",
    title: "3D Printed 6-DOF Robotic Arm + Servos",
    owner: "Sarah J.",
    startDate: "Aug 01, 2026",
    endDate: "Aug 12, 2026",
    dailyRate: "₹150",
    totalPaid: "₹1,850",
    status: "Due Soon",
    daysRemaining: 1,
  }
];

const PAST_RENTALS = [
  {
    id: "r3",
    title: "ESP32 LoRaWAN Gateway Kit",
    owner: "Rahul K.",
    returnDate: "Jul 28, 2026",
    totalPaid: "₹900",
    status: "Returned",
  }
];

export default function RentalsPage() {
  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Hardware Rentals</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your active lab equipment, dev kits, and hardware rentals.
        </p>
      </div>

      {/* Active Rentals */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-400" />
          Active Rentals ({ACTIVE_RENTALS.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACTIVE_RENTALS.map((rental) => (
            <div 
              key={rental.id} 
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    rental.daysRemaining <= 1 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {rental.daysRemaining <= 1 && <AlertCircle className="h-3 w-3" />}
                    {rental.status} ({rental.daysRemaining} days left)
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{rental.dailyRate}/day</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 leading-snug">
                  {rental.title}
                </h3>
                <p className="text-xs text-slate-400">Owner: <span className="font-semibold text-slate-200">{rental.owner}</span></p>
              </div>

              {/* Rental Timeline */}
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>Start: {rental.startDate}</span>
                </div>
                <span>→</span>
                <div>
                  <span>Return: <strong className="text-slate-100">{rental.endDate}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-sm font-bold text-slate-100">Total: {rental.totalPaid}</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors btn-anim active:scale-95">
                    Extend Rental
                  </button>
                  <Link 
                    href={`/products/${rental.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors btn-anim active:scale-95 shadow-md shadow-indigo-600/30"
                  >
                    Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Rentals */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-slate-500" />
          Past Rentals History
        </h2>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800">
            {PAST_RENTALS.map((rental) => (
              <div key={rental.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{rental.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rented from {rental.owner} • Returned on {rental.returnDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-100">{rental.totalPaid}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    {rental.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
