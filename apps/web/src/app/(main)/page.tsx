"use client";

import Link from "next/link";
import { Search, ChevronRight, Star, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatModal } from "@/components/chat/ChatModal";
import { useAuth } from "@/lib/auth-context";

export default function Homepage() {
  const { isBuyer, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [chatModalSeller, setChatModalSeller] = useState<{ name: string; title: string, productId?: string } | null>(null);
  
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch("/api/products/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    // Fetch featured projects (latest 4)
    fetch("/api/products?limit=4")
      .then(res => res.json())
      .then(data => {
        if (data && data.products) {
          setFeaturedProjects(data.products);
          
          const sellersMap = new Map();
          data.products.forEach((p: any) => {
            if (p.seller && !sellersMap.has(p.seller.id)) {
              sellersMap.set(p.seller.id, p.seller);
            }
          });
          setTopSellers(Array.from(sellersMap.values()).slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(search)}`;
    }
  };

  return (
    <div className="space-y-12 pb-12 text-slate-100">
      
      {/* Header & Search Area */}
      <section className="space-y-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Peer-to-Peer College Marketplace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl leading-tight">
            College Project &amp; Hardware Marketplace
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Buy senior design codebases, rent lab hardware, and exchange verified research directly with peers.
          </p>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-500" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Python, ROS2, ESP32, Jetson..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-28 text-slate-100 shadow-xl placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 sm:text-base outline-none transition-all"
            />
            <button 
              type="submit"
              className="absolute right-2.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all btn-anim active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Become a seller banner for buyers */}
      {isBuyer && (
        <section className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Have a capstone project or lab hardware to rent?</span>
            </div>
            <p className="text-xs text-slate-400">
              Apply for ProjectLo Seller Verification to start listing your codebases and earning daily rental fees.
            </p>
          </div>
          <Link
            href="/become-seller"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim whitespace-nowrap"
          >
            Become a Seller
          </Link>
        </section>
      )}

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Browse Categories</h2>
          <Link href="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 btn-anim">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.length > 0 ? categories.map((category) => (
            <Link 
              key={category.name} 
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative flex flex-col items-start justify-between rounded-2xl bg-slate-900/80 p-6 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all btn-anim"
            >
              <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">{category.name}</span>
              <span className="mt-2 text-xs font-medium text-slate-500">{category.count} listings</span>
            </Link>
          )) : (
            <div className="col-span-full text-center text-slate-500 py-4">Loading categories...</div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Featured Approved Projects</h2>
          <Link href="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 btn-anim">
            Explore marketplace <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProjects.length > 0 ? featuredProjects.map((project) => (
            <div key={project.id} className="group relative flex flex-col rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl hover:border-slate-700 transition-all">
              <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                <img 
                  src={project.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.title.substring(0, 2))}&background=1e293b&color=fff&size=400`} 
                  alt={project.title}
                  className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Project
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                    project.type.includes('SALE') 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {project.type}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold text-indigo-400 mb-1">{project.category}</p>
                <h3 className="text-base font-bold text-slate-100 leading-snug mb-1">
                  <Link href={`/products/${project.id}`} className="hover:text-indigo-300 transition-colors">
                    {project.title}
                  </Link>
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <span>By</span>
                  <span className="font-medium text-slate-200">{project.seller?.name}</span>
                  {project.seller?.role === 'SELLER' && (
                    <span className="text-[10px] font-bold text-emerald-400">✓ Verified</span>
                  )}
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-100">
                    {project.type === 'RENT' 
                      ? `₹${(project.priceRentPaise / 100).toFixed(2)}/day` 
                      : `₹${(project.priceSalePaise / 100).toFixed(2)}`}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatModalSeller({ name: project.seller.name, title: project.title, productId: project.id })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors btn-anim"
                      title={`Chat with ${project.seller.name}`}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      {project.seller.rating || 5.0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              <p>No verified projects available in the marketplace yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Sellers */}
      <section>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 mb-6">Verified Sellers</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {topSellers.length > 0 ? topSellers.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="flex items-center gap-4">
                <img 
                  src={seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=6366f1&color=fff`} 
                  alt={seller.name}
                  className="h-12 w-12 rounded-full ring-2 ring-indigo-500/40 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-100 text-sm">{seller.name}</h3>
                    <span title="Verified Seller">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{seller.institution || seller.department || 'Verified Student'}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      {seller.rating || 5.0}
                    </span>
                    <span>•</span>
                    <span>{seller.completedDeals || 0} deals</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setChatModalSeller({ name: seller.name, title: "Listing Query" })}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors btn-anim active:scale-95"
                title={`Chat with ${seller.name}`}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          )) : (
            <div className="col-span-full text-slate-500 text-center py-4">No verified sellers yet.</div>
          )}
        </div>
      </section>

      {/* Chat Modal */}
      {chatModalSeller && (
        <ChatModal
          isOpen={!!chatModalSeller}
          onClose={() => setChatModalSeller(null)}
          sellerName={chatModalSeller.name}
          projectTitle={chatModalSeller.title}
          productId={chatModalSeller.productId}
        />
      )}

    </div>
  );
}
