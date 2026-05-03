"use client";

import { useState, useEffect } from "react";
import { 
  SquaresFour, 
  Users, 
  FileMagnifyingGlass, 
  Calendar, 
  Clock,
  TrendUp,
  ArrowUpRight,
  CaretRight,
  ArrowsClockwise,
  CheckCircle,
  ClockAfternoon
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { motion } from "framer-motion";

const MOCK_DOSSIERS = [
  {
    id: "mock-1",
    title: "تحسين خوارزميات التعلم العميق لتشخيص الأمراض الطبية",
    status: "depose",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    student: { full_name: "محمد الأمين بلقاسم" },
    type: "تحديث"
  },
  {
    id: "mock-2",
    title: "نظم الإدارة الذكية للشبكات الكهربائية المستقلة",
    status: "plagiat_verifie",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    student: { full_name: "سارة بن عودة" },
    type: "جدولة"
  },
  {
    id: "mock-3",
    title: "تأمين المعاملات المالية باستخدام تقنية البلوكشين",
    status: "planifie",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    student: { full_name: "حمزة قادري" },
    type: "لجنة"
  }
];

export default function AdminDashboard() {
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await dossierService.getDossiers();
      
      // Merge with Mock Data
      const realIds = new Set(data.map(d => d.id));
      const filteredMock = MOCK_DOSSIERS.filter(m => !realIds.has(m.id));
      setDossiers([...data, ...filteredMock]);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setDossiers(MOCK_DOSSIERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { 
      label: "إجمالي الملفات", 
      value: dossiers.length.toString(), 
      icon: Users, 
      color: "text-white", 
      premiumBg: "bg-premium-blue" 
    },
    { 
      label: "بانتظار الجدولة", 
      value: dossiers.filter(d => d.status === 'plagiat_verifie' || d.status === 'depose').length.toString(), 
      icon: FileMagnifyingGlass, 
      color: "text-white", 
      premiumBg: "bg-premium-emerald" 
    },
    { 
      label: "المناقشات المجدولة", 
      value: dossiers.filter(d => d.status === 'planifie').length.toString(), 
      icon: Calendar, 
      color: "text-white", 
      premiumBg: "bg-premium-indigo" 
    },
    { 
      label: "ملفات مكتملة", 
      value: dossiers.filter(d => d.status === 'termine' || d.status === 'signe').length.toString(), 
      icon: Clock, 
      color: "text-white", 
      premiumBg: "bg-premium-amber" 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      {/* Hero Banner Modern */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <SquaresFour size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">نظرة عامة على الإدارة</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">إدارة مسار مذكرات التخرج ومراقبة أداء النظام بكفاءة</p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl"
        >
          <span>تحديث البيانات</span>
          <ArrowsClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Grid Modern - Premium Redesign */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card-premium group ${stat.premiumBg}`}>
            {/* Large Decorative Icon on the Left */}
            <div className={`large-icon ${stat.color}`}>
              <stat.icon size={160} weight="fill" />
            </div>
            
            <div className="text-right relative z-10">
              <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
                {stat.value}
              </div>
              <div className="text-white/60 font-bold text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Workflow Monitoring */}
        <div className="lg:col-span-2 space-y-8">
          <div className="content-card">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-2xl font-black text-dark-navy">مراقبة سير العمل</h3>
              <button className="text-primary hover:text-dark-navy text-sm font-bold flex items-center gap-1 transition-colors">
                عرض كل الملفات
                <CaretRight size={16} weight="bold" className="rotate-180" />
              </button>
            </div>
            
            <div className="space-y-4">
              {dossiers.slice(0, 5).map((d, i) => (
                <div key={d.id} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      d.status === 'planifie' ? 'bg-success-light text-success' : 
                      d.status === 'depose' ? 'bg-primary-light text-primary' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {d.status === 'planifie' ? <CheckCircle size={24} weight="fill" /> : <ClockAfternoon size={24} weight="fill" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-dark-navy group-hover:text-primary transition-colors">{d.title}</h4>
                      <p className="text-xs text-text-muted font-bold mt-1">الطالب: {d.student?.full_name} &bull; الحالة: {d.status}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-text-muted uppercase mb-1">تاريخ التحديث</div>
                    <div className="text-xs font-bold text-dark-navy">{new Date(d.updated_at || d.created_at).toLocaleDateString('ar-DZ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-8">
          <div className="content-card">
            <h3 className="text-2xl font-black text-dark-navy mb-8 px-2">أحدث النشاطات</h3>
            <div className="space-y-8">
              {dossiers.slice(0, 4).map((activity, i) => (
                <div key={activity.id} className="flex gap-5 group cursor-pointer relative">
                  {i !== 3 && (
                    <div className="absolute top-12 right-6 w-[2px] h-10 bg-slate-100" />
                  )}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary-light transition-all border border-slate-100 shadow-sm">
                      <ArrowUpRight size={20} weight="bold" className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-dark-navy group-hover:text-primary transition-colors">
                      {activity.id.startsWith('mock') ? 'تحديث تلقائي للملف' : 'إيداع ملف جديد'}: {activity.title.substring(0, 30)}...
                    </h4>
                    <p className="text-sm text-text-muted font-medium mt-1">
                      {new Date(activity.created_at).toLocaleDateString('ar-DZ')} &bull; {activity.type || 'تحديث'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-5 rounded-[20px] bg-slate-50 hover:bg-primary-light hover:text-primary text-dark-navy text-sm font-black transition-all shadow-sm">
              عرض كل النشاطات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
