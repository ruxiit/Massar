"use client";

import Link from "next/link";
import { Student } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-6 py-4 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-soft-sm">
          <Student size={32} weight="fill" className="text-primary" />
          <span className="text-2xl font-extrabold text-dark-navy tracking-tight">مسار</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 bg-white/70 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 shadow-soft-sm">
          <Link href="#features" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">المميزات</Link>
          <Link href="#portals" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">البوابات</Link>
          <Link href="#security" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">الأمان</Link>
        </nav>

        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-2 rounded-full border border-white/20 shadow-soft-sm">
          <Link 
            href="#portals"
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-dark-navy text-white text-sm font-bold transition-all shadow-lg shadow-primary/20"
          >
            سجل الدخول
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
