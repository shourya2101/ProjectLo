"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, Clock, Sparkles, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { useAuth } from "@/lib/auth-context";

export default function SellPage() {
  const router = useRouter();
  const { user, session, isSeller, isAdmin, isSuspended, dbUser, isLoading } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Computer Science",
    subcategory: "",
    inventoryType: "DIGITAL",
    type: "SALE",
    priceSale: "",
    priceRent: "",
    securityDeposit: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-slate-500">Checking seller credentials...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Sign in to List a Project</h1>
        <p className="text-sm text-slate-400">
          You must be logged in with a verified seller account to create listings.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 btn-anim"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // If user is a BUYER and not a SELLER/ADMIN
  if (!isSeller && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
          <Sparkles className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Seller Verification Required
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            ProjectLo requires all project authors and hardware vendors to verify their student or institutional identity before publishing listings.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/become-seller"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim"
          >
            Apply to Become a Seller <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // If seller is suspended
  if (isSuspended) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-4 bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Selling Privileges Suspended</h1>
        <p className="text-sm text-red-300 max-w-md mx-auto">
          {dbUser?.suspendedReason || "Your selling privileges are currently suspended. You cannot create new listings."}
        </p>
      </div>
    );
  }

  // If successfully submitted
  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6 bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
          <Clock className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Status: Pending Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 pt-2">
            Listing Submitted for Moderation!
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            "{submittedSuccess.title}" has been placed in the moderation queue. A ProjectLo administrator will review the codebase details before it appears in the public marketplace.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/my-listings"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all btn-anim"
          >
            Go to My Listings <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setSubmittedSuccess(null);
              setFormData({
                title: "",
                description: "",
                category: "Computer Science",
                subcategory: "",
                inventoryType: "DIGITAL",
                type: "SALE",
                priceSale: "",
                priceRent: "",
                securityDeposit: "",
              });
              removeImage();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all btn-anim"
          >
            Create Another Listing
          </button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!session?.access_token) {
        throw new Error("You must be logged in to create a listing.");
      }

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || null,
        inventoryType: formData.inventoryType,
        type: formData.type,
        priceSalePaise: formData.type === 'SALE' || formData.type === 'BOTH' ? Math.round(parseFloat(formData.priceSale) * 100) : null,
        priceRentPaise: formData.type === 'RENT' || formData.type === 'BOTH' ? Math.round(parseFloat(formData.priceRent) * 100) : null,
        securityDepositPaise: formData.securityDeposit ? Math.round(parseFloat(formData.securityDeposit) * 100) : null,
        image: imageUrl,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Attempt cleanup if product creation fails but image uploaded
        if (imageUrl && imageFile) {
           const filePath = imageUrl.split('project-images/')[1];
           if (filePath) {
             await supabase.storage.from("project-images").remove([filePath]);
           }
        }
        
        setError(errorData.error || "Failed to create listing. Please check required fields.");
        setLoading(false);
        return;
      }

      const newProduct = await res.json();
      setSubmittedSuccess(newProduct);

    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 text-slate-100 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">List a Project</h1>
        <p className="text-slate-400 text-sm">Submit your capstone code, hardware rental, or engineering design.</p>
      </div>

      {/* Moderation notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Moderation Policy:</strong> All listings start in <span className="font-semibold text-amber-300">Pending Review</span> and are reviewed by ProjectLo moderators before appearing publicly in the marketplace.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Project Title *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Autonomous Drone CV Engine"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Description *</label>
          <textarea
            required
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Describe your project, technologies used, and what is included..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Category *</label>
            <select
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Hardware & IoT">Hardware & IoT</option>
              <option value="Data Science">Data Science</option>
              <option value="Mechanical Design">Mechanical Design</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Inventory Type *</label>
            <select
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              value={formData.inventoryType}
              onChange={e => setFormData({...formData, inventoryType: e.target.value})}
            >
              <option value="DIGITAL">Digital (Code, Reports, Designs)</option>
              <option value="PHYSICAL">Physical (Hardware, Devices, Prototypes)</option>
            </select>
          </div>
        </div>

        {/* Listing Type & Pricing */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <label className="block text-sm font-semibold text-slate-300">Listing Type *</label>
          <select
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 mb-4"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="SALE">Sale (Buy Outright)</option>
            <option value="RENT">Rent (Per Day)</option>
            <option value="BOTH">Both (Sale & Rent)</option>
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(formData.type === 'SALE' || formData.type === 'BOTH') && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Sale Price (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 1500"
                  value={formData.priceSale}
                  onChange={e => setFormData({...formData, priceSale: e.target.value})}
                />
              </div>
            )}

            {(formData.type === 'RENT' || formData.type === 'BOTH') && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Rent Price Per Day (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 150"
                  value={formData.priceRent}
                  onChange={e => setFormData({...formData, priceRent: e.target.value})}
                />
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <label className="block text-sm font-semibold text-slate-300">Project Image</label>
          <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-slate-700 px-6 py-10 bg-slate-950/50 hover:bg-slate-950 transition-colors">
            {imagePreview ? (
              <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-indigo-400 focus-within:outline-none hover:text-indigo-300"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg, image/png, image/webp" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-slate-500">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting for Moderation..." : "Submit Project for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
