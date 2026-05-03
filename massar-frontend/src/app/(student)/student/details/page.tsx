
"use client";

import { useState, useEffect } from "react";
import { 
  BookBookmark, 
  User, 
  Calendar, 
  FilePdf, 
  IdentificationCard,
  GraduationCap,
  Info,
  CheckCircle,
  Clock,
  ArrowsClockwise
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { motion } from "framer-motion";

export default function ThesisDetailsPage() {
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const data = await dossierService.getDossiers();
        if (data && data.length > 0) {
          setDossier(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch dossier", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ArrowsClockwise size={40} className="animate-spin text-primary" />
        <p className="text-text-muted font-bold">جاري تحميل تفاصيل المذكرة...</p>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[24px] flex items-center justify-center border-2 border-dashed border-slate-200">
           <Info size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-dark-navy">لا توجد مذكرات مودعة</h3>
          <p className="text-text-muted font-bold">يرجى إيداع مذكرتك أولاً من خلال لوحة التحكم.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
          <BookBookmark size={32} weight="fill" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-dark-navy">تفاصيل المذكرة</h1>
          <p className="text-text-muted font-bold mt-1">المعلومات الأكاديمية الخاصة بمشروع تخرجك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="content-card !p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-16 -translate-y-16" />
            
            <div className="relative z-10 space-y-10">
              <div>
                <label className="text-xs font-black text-primary uppercase tracking-widest block mb-3">عنوان المذكرة</label>
                <h2 className="text-3xl font-black text-dark-navy leading-tight">{dossier.title}</h2>
              </div>

              <div>
                <label className="text-xs font-black text-primary uppercase tracking-widest block mb-3">ملخص البحث</label>
                <p className="text-lg text-text-muted font-medium leading-relaxed bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  {dossier.abstract || "لا يوجد ملخص متاح حالياً."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100">
                       <User size={28} weight="fill" />
                    </div>
                    <div>
                       <div className="text-xs text-text-muted font-bold">الأستاذ المشرف</div>
                       <div className="text-xl font-black text-dark-navy">{dossier.director?.full_name || "أ.د. سمير أمين"}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100">
                       <Calendar size={28} weight="fill" />
                    </div>
                    <div>
                       <div className="text-xs text-text-muted font-bold">تاريخ الإيداع</div>
                       <div className="text-xl font-black text-dark-navy">{new Date(dossier.created_at).toLocaleDateString('ar-DZ')}</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Additional Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="content-card !p-8 flex items-center gap-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                   <GraduationCap size={32} weight="fill" />
                </div>
                <div>
                   <div className="text-xs text-text-muted font-bold">التخصص</div>
                   <div className="text-lg font-black text-dark-navy">إعلام آلي - أنظمة ذكية</div>
                </div>
             </div>
             <div className="content-card !p-8 flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                   <IdentificationCard size={32} weight="fill" />
                </div>
                <div>
                   <div className="text-xs text-text-muted font-bold">رقم التسجيل</div>
                   <div className="text-lg font-black text-dark-navy">{dossier.student?.matricule || "N/A"}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Status Sidebar */}
        <div className="space-y-8">
           <div className="content-card !p-8 bg-dark-navy text-white relative overflow-hidden group">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black">حالة الملف</h4>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary-light text-[10px] font-black border border-white/10 uppercase">
                       {dossier.status}
                    </span>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <CheckCircle size={20} weight="fill" className="text-primary" />
                       <span className="text-sm font-bold opacity-90">تم التحقق من الوثائق</span>
                    </div>
                    <div className="flex items-center gap-3">
                       {dossier.status !== 'depose' ? (
                          <CheckCircle size={20} weight="fill" className="text-primary" />
                       ) : (
                          <Clock size={20} weight="bold" className="text-slate-400" />
                       )}
                       <span className={`text-sm font-bold ${dossier.status === 'depose' ? 'opacity-50' : 'opacity-90'}`}>موافقة المشرف</span>
                    </div>
                 </div>

                 <button className="w-full mt-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black text-sm transition-all flex items-center justify-center gap-2">
                    <FilePdf size={20} weight="fill" />
                    عرض مسودة المذكرة
                 </button>
              </div>
           </div>

           <div className="content-card !p-8 border-2 border-primary-light bg-primary-light/5">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary">
                    <Info size={24} weight="bold" />
                 </div>
                 <h4 className="text-lg font-black text-dark-navy">تنبيهات النظام</h4>
              </div>
              <p className="text-sm text-text-muted font-bold leading-relaxed">
                 تأكد من متابعة بريدك الإلكتروني الجامعي ({dossier.student?.email}) للحصول على إشعارات بخصوص أي تعديلات مطلوبة من المشرف.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
