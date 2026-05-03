"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  ArrowsClockwise,
  PlayCircle,
  FilePdf,
  Student as StudentIcon,
  Archive,
  CloudArrowUp,
  CalendarCheck
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";

export default function ScheduledDiscussions() {
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [pendingDossiers, setPendingDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [deliberationData, setDeliberationData] = useState({
    note: "",
    mention: "Passable",
    observations: "",
    pvFile: null as File | null
  });
  const [isSubmittingDeliberation, setIsSubmittingDeliberation] = useState(false);

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const data = await dossierService.getDossiers();
      setPendingDossiers(data.filter((d: any) => d.status === 'planifie'));
    } catch (error) {
      console.error("Failed to fetch dossiers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  const handleStartDefense = (dossier: any) => {
    setSelectedDossier(dossier);
    setIsDefenseModalOpen(true);
  };

  const handleSubmitDeliberation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier) return;
    
    setIsSubmittingDeliberation(true);
    try {
      const formData = new FormData();
      formData.append("status", "delibere");
      formData.append("note", deliberationData.note);
      formData.append("mention", deliberationData.mention);
      formData.append("observations", deliberationData.observations);
      
      if (deliberationData.pvFile) {
        formData.append("pvFile", deliberationData.pvFile);
      }
      
      await dossierService.updateDossierStatus(selectedDossier.id, 'delibere', formData);
      
      setPendingDossiers(prev => prev.filter(d => d.id !== selectedDossier.id));
      setIsDefenseModalOpen(false);
      setSelectedDossier(null);
      setDeliberationData({ note: "", mention: "Passable", observations: "", pvFile: null });
      alert('تم إتمام المناقشة ورفع المحضر بنجاح!');
    } catch (error) {
      console.error("Failed to submit deliberation", error);
      alert('حدث خطأ أثناء حفظ النتائج.');
    } finally {
      setIsSubmittingDeliberation(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner Modern */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <CalendarCheck size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">المناقشات المبرمجة</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">إدارة الجلسات العلمية، تسجيل الملاحظات، وإتمام محاضر المناقشة</p>
          </div>
        </div>

        <button 
          onClick={fetchDossiers}
          disabled={loading}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl disabled:opacity-50"
        >
          <span>تحديث القائمة</span>
          <ArrowsClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-premium group bg-premium-emerald">
          <div className="large-icon text-white">
            <PlayCircle size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {pendingDossiers.length}
            </div>
            <div className="text-white/60 font-bold text-sm">مناقشات اليوم</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-indigo">
          <div className="large-icon text-indigo-400">
            <Users size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">4</div>
            <div className="text-white/60 font-bold text-sm">أعضاء اللجان</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-emerald">
          <div className="large-icon text-emerald-400">
            <Archive size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">28</div>
            <div className="text-white/60 font-bold text-sm">أرشيف المناقشات</div>
          </div>
        </div>
      </div>

      {/* Discussions Table */}
      <div className="content-card overflow-hidden !p-0">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-2xl font-black text-dark-navy">مناقشات قادمة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/50 text-text-muted font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-10 py-5">الطالب</th>
                <th className="px-10 py-5">عنوان المذكرة</th>
                <th className="px-10 py-5 text-center">الموعد والقاعة</th>
                <th className="px-10 py-5 text-left">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingDossiers.length > 0 ? pendingDossiers.map((dossier) => (
                <tr key={dossier.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-black">
                        {dossier.student?.full_name?.charAt(0) || "S"}
                      </div>
                      <div className="text-right">
                        <div className="text-dark-navy font-bold">{dossier.student?.full_name || 'طالب غير معروف'}</div>
                        <div className="text-xs text-text-muted">{dossier.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-text-muted max-w-[250px] truncate font-medium" title={dossier.title || 'مذكرة'}>
                    {dossier.title || 'مذكرة'}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="text-right">
                      <div className="text-dark-navy font-bold">{dossier.soutenances?.[0]?.salle || 'القاعة غير محددة'}</div>
                      <div className="text-xs text-text-muted">
                        {dossier.soutenances?.[0]?.date_soutenance ? new Date(dossier.soutenances[0].date_soutenance).toLocaleString('ar-DZ') : 'لم يحدد'}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-left">
                    <button 
                      onClick={() => handleStartDefense(dossier)}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-dark-navy text-white font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                      <PlayCircle size={18} weight="bold" />
                      بدء المناقشة
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-text-muted font-medium">
                    لا توجد مناقشات مبرمجة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Defense Modal */}
      {isDefenseModalOpen && selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-navy/60 backdrop-blur-md" onClick={() => setIsDefenseModalOpen(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex animate-in zoom-in-95 duration-300">
            <div className="w-[65%] bg-slate-100 flex flex-col">
              <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FilePdf size={24} weight="fill" className="text-danger" />
                  <span className="font-black text-dark-navy truncate max-w-[300px]">{selectedDossier.title || 'عرض المذكرة'}</span>
                </div>
              </div>
              <div className="flex-1 p-0">
                <iframe 
                  src={selectedDossier.document_url} 
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              </div>
            </div>

            <div className="w-[35%] flex flex-col border-r border-slate-100 overflow-y-auto">
              <div className="p-8 space-y-8">
                <div className="p-6 rounded-[32px] bg-primary-light/30 border border-primary/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                      <StudentIcon size={28} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-dark-navy">{selectedDossier.student?.full_name || 'اسم الطالب'}</h4>
                      <p className="text-xs text-text-muted font-bold">رقم التسجيل: {selectedDossier.student?.matricule || '202035012345'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-dark-navy">تسجيل المحضر</h3>
                  <form onSubmit={handleSubmitDeliberation} className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-dark-navy mb-2">العلامة النهائية (من 20)</label>
                      <input 
                        type="number" 
                        step="0.25"
                        min="0"
                        max="20"
                        required
                        value={deliberationData.note}
                        onChange={(e) => setDeliberationData({...deliberationData, note: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-primary transition-all outline-none font-bold text-dark-navy"
                        placeholder="16.50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-dark-navy mb-2">التقدير</label>
                      <select 
                        value={deliberationData.mention}
                        onChange={(e) => setDeliberationData({...deliberationData, mention: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-primary transition-all outline-none font-bold text-dark-navy appearance-none"
                      >
                        <option value="Passable">مقبول (Passable)</option>
                        <option value="Assez Bien">قريب من الحسن (Assez Bien)</option>
                        <option value="Bien">حسن (Bien)</option>
                        <option value="Très Bien">حسن جداً (Très Bien)</option>
                        <option value="Excellent">ممتاز (Excellent)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-dark-navy mb-2">ملاحظات اللجنة</label>
                      <textarea 
                        rows={4}
                        value={deliberationData.observations}
                        onChange={(e) => setDeliberationData({...deliberationData, observations: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-primary transition-all outline-none font-bold text-dark-navy resize-none"
                        placeholder="اكتب ملاحظات اللجنة هنا..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-dark-navy mb-2">رفع المحضر الموقع (PDF)</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={(e) => setDeliberationData({...deliberationData, pvFile: e.target.files?.[0] || null})}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="px-5 py-6 rounded-2xl border-2 border-dashed border-slate-200 group-hover:border-primary group-hover:bg-primary-light/30 transition-all text-center">
                          <CloudArrowUp size={24} className="mx-auto mb-2 text-text-muted group-hover:text-primary" />
                          <p className="text-xs font-bold text-text-muted group-hover:text-primary">
                            {deliberationData.pvFile ? deliberationData.pvFile.name : "اسحب المحضر هنا أو اضغط للرفع"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsDefenseModalOpen(false)}
                        className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-text-muted font-black hover:bg-slate-50 transition-all"
                      >
                        إلغاء
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmittingDeliberation}
                        className="flex-[2] py-4 rounded-2xl bg-primary hover:bg-dark-navy text-white font-black transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                      >
                        {isSubmittingDeliberation ? "جاري الحفظ..." : "حفظ وإتمام المناقشة"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
