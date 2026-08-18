"use client";

import { Bell, Search, Menu, User, LogOut, MessageSquare, Briefcase, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 text-slate-100">
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-slate-400 lg:hidden hover:bg-slate-800 rounded-md transition-colors btn-anim"
        onClick={onMenuClick}
        aria-label="Open sidebar drawer"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-slate-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <Search 
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-500" 
            aria-hidden="true" 
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-100 placeholder:text-slate-500 focus:ring-0 sm:text-sm outline-none bg-transparent"
            placeholder="Search projects, ROS2, dev kits, or sellers..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Link 
            href="/messages"
            className="relative -m-2.5 p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-full transition-colors btn-anim"
            title="Messages"
          >
            <span className="sr-only">View messages</span>
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#090d16]" />
          </Link>

          <button 
            type="button" 
            className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-full transition-colors btn-anim"
            title="Notifications"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-800" aria-hidden="true" />

          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-800/60 rounded-full sm:rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 btn-anim"
              >
                <img
                  className="h-8 w-8 rounded-full bg-slate-800 ring-2 ring-indigo-500/50"
                  src={user.user_metadata?.avatar_url || undefined}
                  alt={user.user_metadata?.name || user.email}
                />
                <span className="hidden sm:block text-sm font-semibold text-slate-200">
                  {user.user_metadata?.name || user.email}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-sm font-bold text-slate-100">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/messages"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      Messages & Chat
                    </Link>
                    <Link
                      href="/rentals"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Briefcase className="h-4 w-4 text-emerald-400" />
                      My Rentals
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-colors btn-anim active:scale-95"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
