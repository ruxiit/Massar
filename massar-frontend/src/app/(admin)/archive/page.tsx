
"use client";

import { useState, useEffect } from "react";
import { 
  Archive, 
  FilePdf, 
  CheckCircle, 
  Clock, 
  MagnifyingGlass, 
  ArrowsClockwise,
  DownloadSimple,
  ArrowSquareOut,
  FolderOpen,
  WarningCircle
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_ARCHIVE = [
  {
    id: "mock-archive-1",
    title: "تطوير تطبيق لإدارة الموارد البشرية باستخدام الذكاء الاصطناعي",
    status: "archive",
    created_at: new Date(2025, 5, 15).toISOString(),
    student: { full_name: "زينب منصور", email: "z.mansour@univ.dz" },
    soutenances: [{ date_soutenance: new Date(2025, 6, 20).toISOString(), pv_url: "https://example.com/pv1.pdf" }]
  },
  {
    id: "mock-archive-2",
    title: "دراسة أمن الشبكات اللاسلكية في البيئات الصناعية",
    status: "pv_genere",
    created_at: new Date(2025, 10, 10).toISOString(),
    student: { full_name: "عادل كريم", email: "a.karim@univ.dz" },
    soutenances: [{ date_soutenance: new Date(2025, 11, 5).toISOString(), pv_url: "https://example.com/pv2.pdf" }]
  }
];

export default function ArchivePage() {
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isArchiving, setIsArchiving] = useState<string | null>(null);

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const data = await dossierService.getDossiers();
      
      // Merge with mock data
      const realIds = new Set(data.map(d => d.id));
      const filteredMock = MOCK_ARCHIVE.filter(m => !realIds.has(m.id));
      const combined = [...data, ...filteredMock];

      // We show dossiers that are either signed (ready to archive) or already archived
      const archivedData = combined.filter((d: any) => 
        ['pv_genere', 'archive'].includes(d.status)
      );
      setDossiers(archivedData);
    } catch (err) {
      console.error("Failed to fetch archive", err);
      // Fallback to mock data
      setDossiers(MOCK_ARCHIVE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  const handleArchive = async (id: string) => {
    setIsArchiving(id);
    try {
      await dossierService.updateDossierStatus(id, 'archive');
      alert("تمت أرشفة الملف بنجاح!");
      fetchDossiers();
    } catch (err) {
      console.error("Archive failed", err);
      alert("حدث خطأ أثناء الأرشفة.");
    } finally {
      setIsArchiving(null);
    }
  };

  const filteredDossiers = dossiers.filter(d => 
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <Archive size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">الأرشيف الرقمي</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">إدارة وحفظ مذكرات التخرج المكتملة والموقعة إلكترونياً</p>
          </div>
        </div>

        <button 
          onClick={fetchDossiers}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl"
        >
          <span>تحديث الأرشيف</span>
          <ArrowsClockwise size={20} weight="bold" />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-premium group bg-premium-blue">
          <div className="large-icon text-white">
            <FolderOpen size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {dossiers.length}
            </div>
            <div className="text-white/60 font-bold text-sm">إجمالي المذكرات المكتملة</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-emerald">
          <div className="large-icon text-white">
            <CheckCircle size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {dossiers.filter(d => d.status === 'archive').length}
            </div>
            <div className="text-white/60 font-bold text-sm">تمت أرشفتها نهائياً</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-amber">
          <div className="large-icon text-white">
            <Clock size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {dossiers.filter(d => d.status === 'pv_genere').length}
            </div>
            <div className="text-white/60 font-bold text-sm">بانتظار الأرشفة</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="content-card !p-6">
        <div className="relative">
          <MagnifyingGlass size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="البحث برقم الملف، اسم الطالب أو عنوان المذكرة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-14 pl-6 py-5 rounded-[20px] bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white outline-none transition-all font-bold text-dark-navy"
          />
        </div>
      </div>

      {/* Archive List */}
      <div className="content-card">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-separate border-spacing-y-4">
            <thead>
              <tr className="text-text-muted font-black text-xs uppercase tracking-widest">
                <th className="px-6 py-4">رقم الملف</th>
                <th className="px-6 py-4">الطالب</th>
                <th className="px-6 py-4">العنوان</th>
                <th className="px-6 py-4">تاريخ المناقشة</th>
                <th className="px-6 py-4 text-center">المحضر (PV)</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-text-muted font-bold">جاري تحميل الأرشيف...</td>
                </tr>
              ) : filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <WarningCircle size={48} weight="light" className="text-slate-300" />
                      <p className="text-dark-navy font-black text-lg">لا توجد سجلات مطابقة للبحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((dossier) => (
                  <motion.tr 
                    layout
                    key={dossier.id} 
                    className="bg-white hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-6 rounded-r-[24px] border-y-2 border-r-2 border-slate-50 first:border-r-2">
                      <span className="font-black text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full">
                        #{dossier.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-50">
                      <div className="font-black text-dark-navy">{dossier.student?.full_name}</div>
                      <div className="text-xs text-text-muted font-bold mt-1">{dossier.student?.email}</div>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-50">
                      <div className="font-bold text-dark-navy max-w-xs line-clamp-1">{dossier.title}</div>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-50">
                      <div className="font-black text-dark-navy text-sm">
                        {dossier.soutenances?.[0]?.date_soutenance ? 
                          new Date(dossier.soutenances[0].date_soutenance).toLocaleDateString('ar-DZ') : 
                          '---'}
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-50 text-center">
                      {dossier.soutenances?.[0]?.pv_url ? (
                        <a 
                          href={dossier.soutenances[0].pv_url} 
                          target="_blank"
                          className="w-12 h-12 rounded-xl bg-slate-100 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all mx-auto"
                          title="عرض المحضر الموقّع"
                        >
                          <FilePdf size={24} weight="fill" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300 font-bold">غير متوفر</span>
                      )}
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-50 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black inline-flex items-center gap-2 ${
                        dossier.status === 'archive' 
                          ? 'bg-success-light text-success' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {dossier.status === 'archive' ? (
                          <><CheckCircle size={14} weight="fill" /> مؤرشف نهائياً</>
                        ) : (
                          <><Clock size={14} weight="fill" /> بانتظار الأرشفة</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-l-2 border-slate-50 rounded-l-[24px] text-left">
                      <div className="flex items-center gap-2 justify-end">
                        {dossier.status !== 'archive' ? (
                          <button 
                            onClick={() => handleArchive(dossier.id)}
                            disabled={isArchiving === dossier.id}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark-navy text-white text-xs font-black hover:bg-primary transition-all disabled:opacity-50"
                          >
                            {isArchiving === dossier.id ? (
                              <ArrowsClockwise size={16} className="animate-spin" />
                            ) : (
                              <Archive size={16} weight="bold" />
                            )}
                            أرشفة الملف
                          </button>
                        ) : (
                          <button className="p-3 rounded-xl bg-slate-50 text-text-muted hover:text-primary transition-all border border-slate-100">
                             <DownloadSimple size={20} weight="bold" />
                          </button>
                        )}
                        <button className="p-3 rounded-xl bg-slate-50 text-text-muted hover:text-primary transition-all border border-slate-100">
                           <ArrowSquareOut size={20} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
