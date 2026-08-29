"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function MyListingsPage() {
  const { user, session } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
        setLoading(false);
        return;
      }
      
      fetch("http://localhost:4000/api/products/my", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, [session]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }
      
      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-slate-400">Please log in to view your listings.</div>;
  }

  return (
    <div className="space-y-8 text-slate-100 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Listings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your active projects and hardware rentals.</p>
        </div>
        
        <Link href="/sell" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim active:scale-95">
          <Plus className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading your listings...</div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col">
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
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-100 leading-snug mb-1">
                  <Link href={`/products/${product.id}`} className="hover:text-indigo-300 transition-colors">
                    {product.title}
                  </Link>
                </h3>
                <p className="text-xs text-slate-400 mb-4">Posted: {new Date(product.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800">
                  <div>
                    <span className="text-lg font-bold text-slate-100">
                      {product.type === 'RENT' 
                        ? `₹${(product.priceRentPaise / 100).toFixed(2)}/day` 
                        : `₹${(product.priceSalePaise / 100).toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${
                      product.status === 'Available' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800">
                   {/* We won't fully implement edit form right now, but link would go here */}
                   <button onClick={() => alert('Edit feature coming soon!')} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors">
                     <Edit2 className="w-3.5 h-3.5" />
                     Edit
                   </button>
                   <button onClick={() => handleDelete(product.id)} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors border border-red-500/20">
                     <Trash2 className="w-3.5 h-3.5" />
                     Delete
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            <p>You haven't listed any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
