"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const words = ["أسرع وأكثر تنظيماً.", "رقمية بالكامل.", "بين يديك."];

export function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800); // Slightly faster to match the 0.9s animation rhythm
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-background">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-400/10 to-transparent rounded-full blur-[100px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 pr-1.5 pl-6 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg shadow-blue-900/5 mb-8 relative group cursor-default hover:bg-white/80 transition-colors"
          >
            {/* Dedicated Logo Container for Maximum Visibility */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 shrink-0 group-hover:scale-110 transition-transform duration-300 ease-out">
              <Image 
                src="/ubma.png" 
                alt="UBMA Logo" 
                width={32} 
                height={32} 
                className="object-contain" 
              />
            </div>
            <span className="text-dark-navy font-extrabold tracking-tight text-[15px]">
              خاص لجامعة باجي مختار (UBMA)
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, filter: "blur(12px)", y: 30 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black text-dark-navy leading-[1.1] tracking-tight"
          >
           رحلة تخرجك، الآن<br />
            <div className="relative h-[1.2em] flex items-center justify-center">
              <AnimatePresence>
                <motion.span
                  key={words[index]}
                  initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -25, filter: "blur(10px)" }}
                  transition={{ 
                    duration: 0.9, 
                    ease: [0.22, 1, 0.36, 1] // Quintic ease-out for ultra smoothness
                  }}
                  className="absolute text-transparent bg-clip-text bg-gradient-to-l from-primary to-emerald-600 pb-2"
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto leading-relaxed"
          >
            المنصة الأولى المتكاملة لإدارة مذكرات التخرج. من الفكرة إلى المناقشة، نجمع الطالب، المشرف، والإدارة في بيئة رقمية متطورة وآمنة.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link 
              href="#portals"
              className="w-full sm:w-auto px-8 py-4 rounded-[20px] bg-dark-navy text-white text-base font-black transition-all shadow-xl shadow-dark-navy/20 hover:scale-105 hover:bg-primary flex items-center justify-center gap-3 group"
            >
              اختر بوابتك الآن
              <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-[20px] bg-white border-2 border-slate-100 text-dark-navy text-base font-black transition-all shadow-sm hover:border-primary/20 hover:bg-slate-50 flex items-center justify-center gap-3"
            >
              استكشف الميزات
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
