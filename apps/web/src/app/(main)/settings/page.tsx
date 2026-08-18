"use client";

import { User, Bell, Save } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your ProjectLo profile, notifications, and marketplace preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <User className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Peer Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" 
                defaultValue={user?.user_metadata?.name || "Alex Miller"}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">University / Institution</label>
              <input 
                type="text" 
                defaultValue={"Institute of Engineering & Tech"}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department / Major</label>
              <input 
                type="text" 
                defaultValue={"Computer Science & Robotics"}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Academic Email</label>
              <input 
                type="email" 
                disabled
                defaultValue={user?.email || "alex.m@student.edu"}
                className="w-full rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Bell className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-100 block">Rental Expiration Alerts</span>
                <span className="text-xs text-slate-400">Receive reminders 24h before hardware return dates.</span>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950" />
            </label>

            <label className="flex items-center justify-between cursor-pointer border-t border-slate-800 pt-4">
              <div>
                <span className="text-sm font-semibold text-slate-100 block">Order Messages & Updates</span>
                <span className="text-xs text-slate-400">Get notified when a buyer contacts you about your project.</span>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-emerald-400 font-semibold">
            {saved ? "Settings saved successfully!" : ""}
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all btn-anim active:scale-95"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
