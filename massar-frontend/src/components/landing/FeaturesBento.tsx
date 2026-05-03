"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  CalendarPlus, 
  PenNib, 
  Database,
  ArrowUpRight
} from "@phosphor-icons/react";

export function FeaturesBento() {
  return (
    <section id="features" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-dark-navy mb-6 tracking-tight"
          >
            نظام متكامل، ميزات متطورة
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-muted font-medium max-w-2xl mx-auto"
          >
            استفد من أحدث التقنيات لتبسيط الإجراءات الإدارية، حماية الملكية الفكرية، وضمان جودة المذكرات الأكاديمية.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
          
          {/* Feature 1: Plagiarism (Spans 2 cols, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 md:row-span-1 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} weight="fill" />
              </div>
              <ArrowUpRight size={24} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-dark-navy mb-2">فحص الاقتباس الاستباقي</h3>
              <p className="text-text-muted font-medium">تكامل تام مع iThenticate لتنبيه الطلاب والمشرفين بنسب التشابه قبل الإيداع النهائي، لتفادي العقوبات الأكاديمية.</p>
            </div>
          </motion.div>

          {/* Feature 3: Digital Signature (Spans 1 col, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-1 md:row-span-1 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenNib size={32} weight="fill" />
            </div>
            <div>
              <h3 className="text-xl font-black text-dark-navy mb-2">توقيع PAdES الرقمي</h3>
              <p className="text-sm text-text-muted font-medium">تصديق المحاضر قانونياً عبر التشفير.</p>
            </div>
          </motion.div>

          {/* Feature 2: Smart Scheduling (Spans 1 col, 2 rows) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-primary to-dark-navy rounded-[40px] p-10 shadow-xl border border-primary-light/20 flex flex-col justify-between text-white relative overflow-hidden group"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
            
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform z-10">
              <CalendarPlus size={32} weight="fill" />
            </div>
            <div className="z-10">
              <h3 className="text-2xl font-black mb-4">الجدولة الذكية للجان</h3>
              <p className="text-white/80 font-medium leading-relaxed">خوارزميات متقدمة تقترح أفضل المواعيد للمناقشات بناءً على تفرغ الأساتذة وقاعات الجامعة المتوفرة.</p>
            </div>
          </motion.div>

          {/* Feature 4: PROGRES Archive (Spans 3 cols, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:col-span-3 md:row-span-1 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between group hover:shadow-xl transition-all overflow-hidden relative"
          >
            <div className="md:w-2/3 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={32} weight="fill" />
              </div>
              <h3 className="text-2xl font-black text-dark-navy mb-2">الأرشفة والربط مع PROGRES</h3>
              <p className="text-text-muted font-medium">نقل آلي وآمن لجميع مذكرات التخرج المعتمدة إلى قاعدة بيانات الوزارة المركزية دون تدخل يدوي معقد.</p>
            </div>
            
            <div className="md:w-1/3 mt-8 md:mt-0 flex justify-end relative z-10">
              <div className="w-40 h-40 bg-slate-50 rounded-full border-[8px] border-white shadow-inner flex items-center justify-center">
                <span className="text-4xl font-black text-primary">100%</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
