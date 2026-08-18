"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Briefcase,
  Settings,
  MessageSquare,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Discover", href: "/", icon: LayoutDashboard },
  { name: "Marketplace", href: "/products", icon: ShoppingBag },
  { name: "Messages", href: "/messages", icon: MessageSquare, badge: "2" },
  { name: "My Rentals", href: "/rentals", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

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
        <ul className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
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
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    )} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-semibold rounded-full",
                      isActive ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
