"use client";

import { motion } from "framer-motion";
import { Student, ChalkboardTeacher, ShieldStar, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

const portals = [
  {
    id: "student",
    title: "بوابة الطالب",
    description: "أودع مذكرتك، تحقق من نسبة الاقتباس، وتابع تقدمك خطوة بخطوة نحو المناقشة.",
    icon: Student,
    href: "/login/student",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "group-hover:border-indigo-200",
    shadow: "group-hover:shadow-indigo-500/10"
  },
  {
    id: "teacher",
    title: "بوابة المشرف",
    description: "أشرف على طلابك، راجع الملفات المودعة، واقترح لجان المناقشة بسهولة تامة.",
    icon: ChalkboardTeacher,
    href: "/login/teacher",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "group-hover:border-teal-200",
    shadow: "group-hover:shadow-teal-500/10"
  },
  {
    id: "admin",
    title: "بوابة الإدارة",
    description: "تحكم كامل في مسار المذكرات، جدولة ذكية للمناقشات، وتسيير شامل للعمليات.",
    icon: ShieldStar,
    href: "/login/admin",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "group-hover:border-purple-200",
    shadow: "group-hover:shadow-purple-500/10"
  }
];

export function PortalsSection() {
  return (
    <section id="portals" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-dark-navy mb-6 tracking-tight"
          >
            بوابة واحدة، وصول مخصص
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-muted font-medium max-w-2xl mx-auto"
          >
            اختر مسارك للبدء. تم تصميم كل واجهة لتوفير الأدوات والمعلومات الدقيقة التي تحتاجها لدورك في النظام.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link 
                href={portal.href}
                className={`group block p-8 rounded-[40px] bg-slate-50 border-2 border-transparent transition-all duration-300 hover:bg-white hover:-translate-y-2 hover:shadow-2xl ${portal.border} ${portal.shadow} relative overflow-hidden`}
              >
                {/* Decorative background circle */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${portal.bg.replace('50', '200')}`} />
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-[24px] ${portal.bg} ${portal.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <portal.icon size={40} weight="fill" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-dark-navy mb-4 group-hover:text-primary transition-colors">
                    {portal.title}
                  </h3>
                  
                  <p className="text-text-muted font-medium leading-relaxed mb-10 h-20">
                    {portal.description}
                  </p>
                  
                  <div className={`inline-flex items-center gap-2 font-bold ${portal.color} opacity-80 group-hover:opacity-100 group-hover:translate-x-[-8px] transition-all duration-300`}>
                    دخول للبوابة
                    <ArrowLeft size={20} weight="bold" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
