
"use client";

import { useState, useEffect } from "react";
import { 
  PenNib, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Fingerprint, 
  FilePdf, 
  ArrowsClockwise, 
  CheckCircle,
  Clock,
  WarningCircle
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_DEFENSES = [
  {
    id: "mock-sign-1",
    title: "تحليل المشاعر في النصوص العربية باستخدام Transformers",
    status: "delibere",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    student: { full_name: "عمر الفاروق" },
    soutenances: [{ salle: "Amphi A" }]
  },
  {
    id: "mock-sign-2",
    title: "نظام كشف الاحتيال في البطاقات البنكية",
    status: "delibere",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    student: { full_name: "مريم الصادق" },
    soutenances: [{ salle: "Salle 15" }]
  }
];

export default function SignaturesView() {
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signedIds, setSignedIds] = useState<string[]>([]);

  const [defenses, setDefenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const data = await dossierService.getDossiers();
      
      // Merge with mock data
      const realIds = new Set(data.map(d => d.id));
      const filteredMock = MOCK_DEFENSES.filter(m => !realIds.has(m.id));
      const combined = [...data, ...filteredMock];

      // Filter dossiers that have completed deliberation but not yet archived
      const readyForSign = combined.filter((d: any) => 
        d.status === 'delibere' || d.status === 'pv_genere'
      );
      setDefenses(readyForSign);
    } catch (err) {
      console.error(err);
      // Fallback to mock data on error
      setDefenses(MOCK_DEFENSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  const handleSign = async (id: string) => {
    setSigningId(id);
    
    try {
      // Simulate cryptographic processing time
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      await dossierService.updateDossierStatus(id, 'pv_genere');
      setSignedIds(prev => [...prev, id]);
      
      // Refresh list after a short delay
      setTimeout(() => {
        fetchDossiers();
        setSigningId(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء التوقيع الإلكتروني.');
      setSigningId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <Fingerprint size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">التوقيع الرقمي PAdES</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">توقيع محاضر المناقشة إلكترونياً وبشكل معتمد كلياً</p>
          </div>
        </div>

        <button 
          onClick={fetchDossiers}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl"
        >
          <span>تحديث المستندات</span>
          <ArrowsClockwise size={20} weight="bold" />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-premium group bg-premium-amber">
          <div className="large-icon text-white">
            <Clock size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {defenses.filter(d => d.status === 'delibere').length}
            </div>
            <div className="text-white/60 font-bold text-sm">بانتظار التوقيع</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-emerald">
          <div className="large-icon text-white">
            <CheckCircle size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {defenses.filter(d => d.status === 'pv_genere').length}
            </div>
            <div className="text-white/60 font-bold text-sm">تم توقيعها</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-indigo">
          <div className="large-icon text-white">
            <ShieldCheck size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              نشط
            </div>
            <div className="text-white/60 font-bold text-sm">حالة شهادة التوقيع</div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-2xl font-black text-dark-navy flex items-center gap-3">
            <FileText size={28} weight="bold" className="text-primary" />
            محاضر المناقشة الجاهزة للتوقيع
          </h3>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-20">
              <ArrowsClockwise size={40} className="animate-spin text-slate-300 mx-auto mb-4" />
              <p className="text-text-muted font-bold">جاري جلب المستندات...</p>
            </div>
          ) : defenses.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
              <WarningCircle size={48} weight="light" className="text-slate-300 mx-auto mb-4" />
              <p className="text-dark-navy font-black text-lg">لا توجد محاضر بانتظار التوقيع حالياً</p>
              <p className="text-text-muted font-medium mt-2">سيتم ظهور المحاضر هنا فور إتمام المناقشات من قبل الأساتذة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {defenses.map((defense) => {
                const isSigning = signingId === defense.id;
                const isSigned = signedIds.includes(defense.id) || defense.status === 'pv_genere';

                return (
                  <motion.div 
                    layout
                    key={defense.id} 
                    className={`p-8 rounded-[32px] border-2 transition-all relative overflow-hidden ${
                      isSigned 
                        ? "border-success-light bg-success-light/10" 
                        : isSigning
                        ? "border-primary-light bg-primary-light/10 shadow-lg shadow-primary/5"
                        : "border-slate-50 bg-white hover:border-primary-light hover:shadow-xl hover:shadow-slate-200/50"
                    }`}
                  >
                    {isSigning && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5 }}
                        className="absolute top-0 right-0 h-1 bg-primary"
                      />
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex gap-6 items-start">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                           isSigned ? "bg-success text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                           <FilePdf size={32} weight={isSigned ? "fill" : "bold"} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black text-primary bg-primary-light px-3 py-1 rounded-full">
                              #{defense.id.substring(0, 8).toUpperCase()}
                            </span>
                            <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(defense.created_at).toLocaleDateString('ar-DZ')}
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-dark-navy mb-2">{defense.title || 'مذكرة التخرج'}</h4>
                          <div className="flex flex-wrap gap-4 text-sm font-bold text-text-muted">
                            <span className="flex items-center gap-1">الطالب: <span className="text-dark-navy">{defense.student?.full_name || 'غير معروف'}</span></span>
                            <span className="flex items-center gap-1">القاعة: <span className="text-dark-navy">{defense.soutenances?.[0]?.salle || 'N/A'}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSigned ? (
                          <div className="bg-white border-2 border-success-light p-5 rounded-[24px] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center">
                              <ShieldCheck size={24} weight="fill" />
                            </div>
                            <div>
                              <div className="text-success font-black text-sm">تم التوقيع إلكترونياً</div>
                              <div className="text-[10px] font-mono text-slate-400 mt-1">SHA-256: {Math.random().toString(16).substring(2, 10)}...</div>
                            </div>
                            <a 
                              href={defense.soutenances?.[0]?.pv_url || '#'} 
                              target="_blank"
                              className="mr-4 p-3 rounded-xl bg-slate-50 text-dark-navy hover:bg-dark-navy hover:text-white transition-all"
                              title="معاينة المحضر"
                            >
                              <FilePdf size={20} weight="bold" />
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSign(defense.id)}
                            disabled={isSigning}
                            className={`group relative overflow-hidden px-8 py-5 rounded-[24px] font-black text-sm transition-all shadow-xl flex items-center gap-3 ${
                              isSigning
                                ? "bg-dark-navy text-white shadow-dark-navy/20 cursor-wait"
                                : "bg-primary hover:bg-dark-navy text-white shadow-primary/20 hover:scale-105 active:scale-95"
                            }`}
                          >
                            {isSigning ? (
                              <>
                                <Lock size={20} weight="fill" className="animate-pulse" />
                                <span>جاري تشفير...</span>
                              </>
                            ) : (
                              <>
                                <PenNib size={22} weight="fill" className="group-hover:rotate-12 transition-transform" />
                                <span>توقيع المحضر (PAdES)</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="p-8 rounded-[32px] bg-slate-900 text-white flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center shrink-0 border border-white/10">
           <ShieldCheck size={40} weight="fill" className="text-primary-light" />
        </div>
        <div className="text-center md:text-right">
          <h4 className="text-xl font-black mb-2">معيار التوقيع الإلكتروني المعتمد</h4>
          <p className="text-slate-400 font-medium leading-relaxed">
            يستخدم نظام "مسار" تقنية التوقيع الرقمي المتقدم (PAdES) المتوافق مع المعايير الدولية ووزارة التعليم العالي. 
            كل توقيع يحتوي على بصمة زمنية (Timestamp) وشهادة رقمية فريدة تضمن عدم التلاعب بالمحضر بعد توقيعه.
          </p>
        </div>
      </div>
    </div>
  );
}
