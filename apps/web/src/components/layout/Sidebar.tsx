"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Briefcase,
  Settings,
  MessageSquare,
  Sparkles,
  BarChart3,
  Package,
  PlusCircle,
  ShieldAlert,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { role, isBuyer, isSeller, isAdmin, isAuthenticated } = useAuth();

  // Construct role-based navigation items
  const navItems = [
    // Common item for non-admins or general discover
    ...(isAdmin ? [] : [{ name: "Discover", href: "/", icon: LayoutDashboard }]),
    { name: "Marketplace", href: "/products", icon: ShoppingBag },

    // Admin exclusive section
    ...(isAdmin ? [
      { name: "Admin Dashboard", href: "/admin", icon: ShieldAlert },
    ] : []),

    // Seller exclusive section
    ...(isSeller ? [
      { name: "Seller Dashboard", href: "/seller", icon: BarChart3 },
      { name: "My Listings", href: "/my-listings", icon: Package },
      { name: "Add Listing", href: "/sell", icon: PlusCircle },
    ] : []),

    // Common messaging & rentals
    { name: "Messages", href: "/messages", icon: MessageSquare },
    ...(!isAdmin ? [{ name: "My Rentals", href: "/rentals", icon: Briefcase }] : []),

    // Buyer exclusive: Become a Seller
    ...(isBuyer && isAuthenticated ? [
      { name: "Become a Seller", href: "/become-seller", icon: Sparkles, highlight: true },
    ] : []),

    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800 bg-[#0b0f19]">
        <Link href="/" className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30">
            <span className="text-base font-bold text-white">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ProjectLo</span>
        </Link>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors btn-anim"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 bg-[#0b0f19]">
        {/* Role badge */}
        {isAuthenticated && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Account Role</span>
            <span className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
              isAdmin && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
              isSeller && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
              isBuyer && "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            )}>
              {role}
            </span>
          </div>
        )}

        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 btn-anim",
                    isActive 
                      ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20 shadow-sm" 
                      : item.highlight
                        ? "text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-indigo-400" : item.highlight ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    )} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
