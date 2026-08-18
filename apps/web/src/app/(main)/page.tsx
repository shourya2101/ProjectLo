"use client";

import Link from "next/link";
import { Search, ChevronRight, Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { ChatModal } from "@/components/chat/ChatModal";

const CATEGORIES = [
  { name: "Computer Science", count: 142 },
  { name: "Hardware & IoT", count: 85 },
  { name: "Data Science", count: 64 },
  { name: "Mechanical Design", count: 32 },
];

const FEATURED_PROJECTS = [
  { id: 1, title: "Autonomous Drone CV Engine", category: "Computer Science", seller: "Alex Miller", price: "₹1,200", rating: 4.9, type: "Sale" },
  { id: 2, title: "Nvidia Jetson Orin Nano Dev Kit", category: "Hardware & IoT", seller: "Priya S.", price: "₹200/day", rating: 4.8, type: "Rent" },
  { id: 3, title: "Financial Market Predictor ML Model", category: "Data Science", seller: "David K.", price: "₹850", rating: 4.7, type: "Sale" },
  { id: 4, title: "3D Printed Robotic Arm Assembly", category: "Mechanical Design", seller: "Sarah J.", price: "₹150/day", rating: 5.0, type: "Rent" },
];

const TOP_SELLERS = [
  { name: "Alex Miller", sales: 45, rating: 4.9, department: "Robotics & CS" },
  { name: "Priya S.", sales: 38, rating: 4.8, department: "Embedded IoT" },
  { name: "David K.", sales: 29, rating: 4.7, department: "Data Science" },
];

export default function Homepage() {
  const [search, setSearch] = useState("");
  const [chatModalSeller, setChatModalSeller] = useState<{ name: string; title: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-12 pb-12 text-slate-100">
      
      {/* Header & Search Area */}
      <section className="space-y-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <span>Verified Peer-to-Peer Marketplace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl leading-tight">
            College Project & Hardware Marketplace
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

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Browse Categories</h2>
          <Link href="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 btn-anim">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.name} 
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative flex flex-col items-start justify-between rounded-2xl bg-slate-900/80 p-6 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all btn-anim"
            >
              <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">{category.name}</span>
              <span className="mt-2 text-xs font-medium text-slate-500">{category.count} listings</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Featured Projects</h2>
          <Link href="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 btn-anim">
            Explore marketplace <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PROJECTS.map((project) => (
            <div key={project.id} className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl hover:border-slate-700 transition-all">
              <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(project.title.substring(0, 2))}&background=1e293b&color=fff&size=400`} 
                  alt={project.title}
                  className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                    project.type === 'Sale' 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {project.type}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold text-indigo-400 mb-1">{project.category}</p>
                <h3 className="text-base font-bold text-slate-100 leading-snug mb-2">
                  <Link href={`/products/${project.id}`} className="hover:text-indigo-300 transition-colors">
                    {project.title}
                  </Link>
                </h3>
                
                <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-100">{project.price}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatModalSeller({ name: project.seller, title: project.title })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors btn-anim"
                      title={`Chat with ${project.seller}`}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      {project.rating}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Sellers */}
      <section>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 mb-6">Top Rated Sellers</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TOP_SELLERS.map((seller) => (
            <div key={seller.name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="flex items-center gap-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=6366f1&color=fff`} 
                  alt={seller.name}
                  className="h-12 w-12 rounded-full ring-2 ring-indigo-500/40"
                />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{seller.name}</h3>
                  <p className="text-xs text-slate-400">{seller.department}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                      {seller.rating}
                    </span>
                    <span>•</span>
                    <span>{seller.sales} deals</span>
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
          ))}
        </div>
      </section>

      {/* Chat Modal */}
      {chatModalSeller && (
        <ChatModal
          isOpen={!!chatModalSeller}
          onClose={() => setChatModalSeller(null)}
          sellerName={chatModalSeller.name}
          projectTitle={chatModalSeller.title}
        />
      )}

    </div>
  );
}
