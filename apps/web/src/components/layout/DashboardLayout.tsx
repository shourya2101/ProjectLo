"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AlertOctagon } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  
  const { isSuspended } = useAuth();

  if (isSuspended) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] p-4 text-slate-100">
        <div className="max-w-md w-full space-y-6 bg-slate-900 p-8 rounded-3xl border border-red-500/30 text-center shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
            <AlertOctagon className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-100">Account Blocked</h1>
            <p className="text-sm text-red-300 leading-relaxed">
              Your access to the ProjectLo platform has been suspended by an administrator. You can no longer access marketplace features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close on Escape key press & manage focus
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMobileMenuOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity" 
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Drawer on Mobile, Normal Flow on Desktop */}
      <div 
        ref={sidebarRef}
        role="dialog"
        aria-modal={isMobileMenuOpen ? "true" : undefined}
        aria-label="Navigation Sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0f19] border-r border-slate-800 shadow-2xl transform transition-transform duration-200 ease-in-out flex flex-col
          lg:relative lg:translate-x-0 lg:shadow-none lg:shrink-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
