"use client";

import { Student } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Student size={32} weight="fill" className="text-primary" />
            <span className="text-2xl font-extrabold text-dark-navy tracking-tight">مسار</span>
          </div>
          
          <div className="text-text-muted font-medium text-sm">
            © {new Date().getFullYear()} جامعة باجي مختار (UBMA). جميع الحقوق محفوظة.
          </div>
          
          <div className="flex gap-6 text-sm font-bold text-text-muted">
            <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-primary transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-primary transition-colors">الدعم الفني</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
