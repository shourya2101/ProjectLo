"use client";

import { useState } from "react";
import { Search, Filter, Plus, ChevronDown, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ChatModal } from "@/components/chat/ChatModal";

const DUMMY_PRODUCTS = [
  { id: 1, title: "Autonomous Drone CV Engine", seller: "Alex Miller", category: "Hardware", type: "Rent", price: "₹200/day", status: "Available", image: "https://ui-avatars.com/api/?name=AM&background=0D8ABC&color=fff" },
  { id: 2, title: "Machine Learning Notebooks", seller: "David K.", category: "Digital", type: "Sale", price: "₹500", status: "Available", image: "https://ui-avatars.com/api/?name=ML&background=10B981&color=fff" },
  { id: 3, title: "Final Year CS Report & Specs", seller: "Sarah J.", category: "Digital", type: "Sale", price: "₹1,200", status: "Sold Out", image: "https://ui-avatars.com/api/?name=CS&background=F59E0B&color=fff" },
  { id: 4, title: "IoT Smart Home Dev Kit", seller: "Priya S.", category: "Hardware", type: "Sale & Rent", price: "₹4,500", status: "Available", image: "https://ui-avatars.com/api/?name=IO&background=6366F1&color=fff" },
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [chatModalSeller, setChatModalSeller] = useState<{ name: string; title: string } | null>(null);

  const filteredProducts = DUMMY_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Project & Hardware Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">Browse, buy, and rent college projects from verified peers.</p>
        </div>
        
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim active:scale-95">
          <Plus className="w-4 h-4" />
          Add Listing
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-96 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search listings..." 
            className="bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-slate-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors btn-anim active:scale-95">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors btn-anim active:scale-95">
            Sort by: Newest
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col">
            <div className="h-48 bg-slate-950 relative w-full overflow-hidden">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover opacity-85" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-200 border border-slate-700 shadow-sm">
                  {product.category}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  product.type.includes('Sale') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {product.type}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-base font-bold text-slate-100 leading-snug mb-1">
                <Link href={`/products/${product.id}`} className="hover:text-indigo-300 transition-colors">
                  {product.title}
                </Link>
              </h3>
              <p className="text-xs text-slate-400 mb-4">Seller: <span className="text-slate-300 font-medium">{product.seller}</span></p>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800">
                <div>
                  <span className="text-lg font-bold text-slate-100">{product.price}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChatModalSeller({ name: product.seller, title: product.title })}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors btn-anim active:scale-95"
                    title={`Chat with ${product.seller}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>

                  <span className={`text-xs font-semibold ${
                    product.status === 'Available' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
