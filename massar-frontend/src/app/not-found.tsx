"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl shadow-indigo-100 flex items-center justify-center mx-auto border border-white">
            <span className="text-6xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              404
            </span>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-lg shadow-amber-50">
            <HelpCircle size={24} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-slate-500 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved to a new location.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-3xl transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 active:translate-y-0"
          >
            <MoveLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="pt-12 text-slate-400 text-sm font-medium">
          PUI UBMA v9.0 &bull; Massar Portal
        </div>
      </div>
    </div>
  );
}
