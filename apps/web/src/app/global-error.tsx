"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full space-y-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl text-center">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
            <AlertTriangle className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-100">Application Error</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {error?.message || "An unexpected error occurred. Please try reloading the page."}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
