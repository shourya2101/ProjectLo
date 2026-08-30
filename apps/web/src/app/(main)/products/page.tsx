"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, ChevronDown, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ChatModal } from "@/components/chat/ChatModal";
import { useAuth } from "@/lib/auth-context";

export default function Marketplace() {
  const { isSeller, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatModalSeller, setChatModalSeller] = useState<{ name: string; title: string; productId: string } | null>(null);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = "/api/products?";
    if (searchTerm) {
      query += `search=${encodeURIComponent(searchTerm)}`;
    }
    fetch(query)
      .then(res => res.json())
      .then(data => {
        if (data && data.products) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchTerm]);

  return (
    <div className="space-y-8 text-slate-100 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Project &amp; Hardware Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">Browse, buy, and rent college projects from verified peers.</p>
        </div>
        
        {(isSeller || isAdmin) && (
          <Link href="/sell" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim active:scale-95">
            <Plus className="w-4 h-4" />
            Add Listing
          </Link>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-96 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search verified listings..." 
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
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading listings...</div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col">
              <div className="h-48 bg-slate-950 relative w-full overflow-hidden group">
                <img src={product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title.substring(0, 2))}&background=1e293b&color=fff&size=400`} alt={product.title} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-200 border border-slate-700 shadow-sm">
                    {product.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    product.type.includes('SALE') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {product.type}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Project
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-100 leading-snug mb-1">
                  <Link href={`/products/${product.id}`} className="hover:text-indigo-300 transition-colors">
                    {product.title}
                  </Link>
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <span>Seller:</span>
                  <span className="text-slate-200 font-medium">{product.seller?.name}</span>
                  {product.seller?.role === 'SELLER' && (
                    <span className="text-[10px] font-bold text-emerald-400">✓ Verified</span>
                  )}
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800">
                  <div>
                    <span className="text-lg font-bold text-slate-100">
                      {product.type === 'RENT' 
                        ? `₹${(product.priceRentPaise / 100).toFixed(2)}/day` 
                        : `₹${(product.priceSalePaise / 100).toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatModalSeller({ name: product.seller.name, title: product.title, productId: product.id.toString() })}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors btn-anim active:scale-95"
                      title={`Chat with ${product.seller.name}`}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            <p>No listings found in the verified marketplace.</p>
          </div>
        )}
      </div>

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
