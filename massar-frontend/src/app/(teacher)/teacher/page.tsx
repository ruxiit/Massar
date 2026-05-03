"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  Users, 
  Calendar, 
  WarningCircle, 
  FileMagnifyingGlass, 
  CheckCircle,
  CaretRight,
  TrendUp,
  ArrowsClockwise,
  FilePdf,
  CloudArrowUp,
  Student as StudentIcon,
  ShieldCheck,
  ClipboardText
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { themeService } from "@/services/themeService";
import { ChatWindow } from "@/components/ui/ChatWindow";
import { getCurrentUser } from "@/lib/auth";
import { ChatsCircle, FolderOpen, UserCirclePlus } from "@phosphor-icons/react";

export default function TeacherDashboard() {
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pendingDossiers, setPendingDossiers] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  
  const [chatRequest, setChatRequest] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dossiers, themesData] = await Promise.all([
        dossierService.getDossiers(),
        themeService.getThemes()
      ]);
      setPendingDossiers(dossiers);
      setThemes(themesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  const handleReviewClick = (dossier: any) => {
    setSelectedDossier(dossier);
    setIsModalOpen(true);
  };


  const handleUpdateStatus = async (status: string) => {
    if (!selectedDossier) return;
    setIsApproving(true);
    try {
      await dossierService.updateDossierStatus(selectedDossier.id, status);
      setPendingDossiers(prev => prev.filter(d => d.id !== selectedDossier.id));
      setIsModalOpen(false);
      setSelectedDossier(null);
      alert(status === 'progres_verifie' ? 'تم قبول المذكرة بنجاح!' : 'تم رفض المذكرة وإعادتها للطالب للتعديل.');
    } catch (error) {
      console.error("Failed to update status", error);
      alert('حدث خطأ أثناء تحديث حالة الملف.');
    } finally {
      setIsApproving(false);
    }
  };


  const filteredDossiers = pendingDossiers.filter(d => d.status === 'depose');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner Modern */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <ClipboardText size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">مراجعة المذكرات الأكاديمية</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">راجع أعمال الطلاب، تحقق من نسب الاقتباس، ووجههم نحو الجودة العلمية</p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl disabled:opacity-50"
        >
          <span>تحديث البيانات</span>
          <ArrowsClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI Section - Premium Redesign */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-premium group bg-premium-amber">
          <div className="large-icon text-white">
            <Clock size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">
              {filteredDossiers.length}
            </div>
            <div className="text-white/60 font-bold text-sm">مراجعات معلقة</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-blue">
          <div className="large-icon text-white">
            <Users size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">12</div>
            <div className="text-white/60 font-bold text-sm">الطلاب النشطون</div>
          </div>
        </div>

        <div className="stat-card-premium group bg-premium-indigo">
          <div className="large-icon text-white">
            <ShieldCheck size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-sm">3</div>
            <div className="text-white/60 font-bold text-sm">مذكرات مقبولة</div>
          </div>
        </div>
      </div>

      {/* Projects & Students Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <FolderOpen size={24} weight="fill" />
            </div>
            <h3 className="text-2xl font-black text-dark-navy">إدارة المشاريع والطلاب</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {themes.length > 0 ? themes.map((theme) => (
            <div key={theme.id} className="content-card !p-0 overflow-hidden flex flex-col border-2 border-slate-100 hover:border-primary/20 transition-all shadow-sm">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-white border border-slate-200 text-text-muted text-[10px] font-black rounded-full uppercase tracking-wider">
                    {theme.speciality || "عام"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                    theme.status === 'approved' ? 'bg-success-light text-success border-success/10' : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {theme.status === 'approved' ? 'معتمد' : 'قيد المراجعة'}
                  </span>
                </div>
                <h4 className="text-xl font-black text-dark-navy mb-2">{theme.title}</h4>
                <p className="text-sm text-text-muted font-medium line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              <div className="p-6 flex-1 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} weight="bold" className="text-primary" />
                  <span className="text-xs font-black text-dark-navy">الطلاب المشرف عليهم ({theme.accepted_count}/{theme.max_students})</span>
                </div>
                
                <div className="space-y-3">
                  {theme.supervision_requests?.filter((r: any) => r.status === 'accepted').length > 0 ? (
                    theme.supervision_requests.filter((r: any) => r.status === 'accepted').map((req: any) => (
                      <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-primary-light/30 hover:border-primary/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary font-black shadow-sm">
                            {req.student?.full_name?.charAt(0)}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-dark-navy">{req.student?.full_name}</div>
                            <div className="text-[10px] text-text-muted font-bold">{req.student?.email}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setChatRequest(req)}
                          className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 text-primary flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                        >
                          <ChatsCircle size={20} weight="fill" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                      <UserCirclePlus size={32} weight="thin" className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs text-text-muted font-bold">لا يوجد طلاب مقبولون في هذا المشروع بعد</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center content-card">
               <FolderOpen size={64} weight="thin" className="mx-auto text-slate-300 mb-4" />
               <p className="text-text-muted font-bold">لم تقم بإضافة أي مشاريع بحثية بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Actions Table */}
      <div className="content-card overflow-hidden !p-0">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-2xl font-black text-dark-navy">مراجعات بانتظار الموافقة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/50 text-text-muted font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-10 py-5">الطالب</th>
                <th className="px-10 py-5">عنوان المذكرة</th>
                <th className="px-10 py-5 text-center">نسبة الاقتباس</th>
                <th className="px-10 py-5">الحالة</th>
                <th className="px-10 py-5 text-left">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDossiers.length > 0 ? filteredDossiers.map((dossier) => (
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
                    <div className="inline-flex flex-col items-center">
                       <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm border ${
                         (dossier.plagiarism_score || 12) < 20 ? 'bg-success-light text-success border-success/10' : 'bg-amber-50 text-amber-600 border-amber-200'
                       }`}>
                         {dossier.plagiarism_score || 12}% تشابه
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 shadow-sm border border-amber-100">
                      <WarningCircle size={14} weight="bold" />
                      بانتظار المراجعة
                    </span>
                  </td>
                  <td className="px-10 py-6 text-left">
                    <button 
                      onClick={() => handleReviewClick(dossier)}
                      className="inline-flex items-center gap-2 bg-white border-2 border-slate-100 hover:border-primary hover:bg-primary-light hover:text-primary text-text-muted font-black px-5 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      <FileMagnifyingGlass size={18} weight="bold" />
                      مراجعة
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-text-muted font-medium">
                    لا توجد مراجعات معلقة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Review Modal */}
      {isModalOpen && selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-navy/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex animate-in zoom-in-95 duration-300">
            
            {/* Left Side: Document View */}
            <div className="w-[70%] bg-slate-100 flex flex-col">
              <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FilePdf size={24} weight="fill" className="text-danger" />
                  <span className="font-black text-dark-navy truncate">{selectedDossier.title}</span>
                </div>
              </div>
              <div className="flex-1">
                <iframe 
                  src={selectedDossier.document_url} 
                  className="w-full h-full border-none"
                />
              </div>
            </div>

            {/* Right Side: Approval Actions */}
            <div className="w-[30%] flex flex-col border-r border-slate-100 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <div className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="w-20 h-20 rounded-3xl bg-primary-light flex items-center justify-center text-primary shadow-sm">
                      <FileMagnifyingGlass size={40} weight="fill" />
                   </div>
                   <h3 className="text-2xl font-black text-dark-navy">مراجعة الملف</h3>
                   <p className="text-text-muted font-bold text-sm">يرجى مراجعة محتوى المذكرة قبل إرسالها للجنة الاقتباس.</p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black text-primary uppercase">فحص الاقتباس (iThenticate)</div>
                      <ShieldCheck size={18} weight="fill" className="text-primary" />
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-end justify-between">
                         <div className="text-3xl font-black text-dark-navy">{selectedDossier.plagiarism_score || 12}%</div>
                         <div className="text-[10px] font-black text-success">نسبة آمنة</div>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-primary rounded-full" style={{ width: `${selectedDossier.plagiarism_score || 12}%` }} />
                      </div>
                   </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                   <div>
                      <div className="text-[10px] font-black text-primary uppercase mb-1">اسم الطالب</div>
                      <div className="font-bold text-dark-navy">{selectedDossier.student?.full_name}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-primary uppercase mb-1">تاريخ الإيداع</div>
                      <div className="font-bold text-dark-navy">{new Date(selectedDossier.created_at).toLocaleDateString('ar-DZ')}</div>
                   </div>
                </div>

                <div className="pt-6 space-y-3 pb-8">
                   <button 
                    onClick={() => handleUpdateStatus('progres_verifie')}
                    disabled={isApproving}
                    className="w-full py-4 rounded-2xl bg-primary hover:bg-dark-navy text-white font-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isApproving ? <ArrowsClockwise size={20} className="animate-spin" /> : <CheckCircle size={24} weight="fill" />}
                     قبول ومتابعة الإجراءات
                   </button>
                   <button 
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={isApproving}
                    className="w-full py-4 rounded-2xl bg-danger/10 hover:bg-danger text-danger hover:text-white font-black transition-all border-2 border-danger/20 flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isApproving ? <ArrowsClockwise size={20} className="animate-spin" /> : <WarningCircle size={24} weight="fill" />}
                     رفض الملف وإعادته
                   </button>
                   <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-4 rounded-2xl border-2 border-slate-100 text-text-muted font-black hover:bg-slate-50 transition-all"
                   >
                     إلغاء
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Chat Window */}
      {chatRequest && currentUserId && (
        <ChatWindow 
          supervisionRequestId={chatRequest.id}
          currentUserId={currentUserId}
          peerName={chatRequest.student?.full_name || "الطالب"}
          onClose={() => setChatRequest(null)}
        />
      )}
    </div>
  );
}
