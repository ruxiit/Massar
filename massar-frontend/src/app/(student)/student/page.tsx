"use client";

import { useState, useEffect } from "react";
import { WorkflowStepper } from "@/components/ui/WorkflowStepper";
import {
  CloudArrowUp, WarningCircle, CheckCircle, FilePdf, FileText,
  ArrowsClockwise, Student, ShieldCheck, GraduationCap, ChatsCircle, Clock,
  Quotes, Star, DownloadSimple
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { supervisionService } from "@/services/supervisionService";
import { themeService } from "@/services/themeService";
import { ChatWindow } from "@/components/ui/ChatWindow";
import { PlagiarismModal } from "@/components/ui/PlagiarismModal";
import { getCurrentUser } from "@/lib/auth";

export default function StudentDashboard() {
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);
  const [isPlagiarismModalOpen, setIsPlagiarismModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Supervision flow state
  const [acceptedRequest, setAcceptedRequest] = useState<any>(null);
  const [approvedThemes, setApprovedThemes] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [studentMessage, setStudentMessage] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Chat state
  const [chatRequest, setChatRequest] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);

    const init = async () => {
      try {
        const [dossiersData, acceptedData, requestsData] = await Promise.all([
          dossierService.getDossiers(),
          supervisionService.getMyAcceptedRequest(),
          supervisionService.getMyRequests(),
        ]);
        if (dossiersData?.length > 0) { 
          const activeDossier = dossiersData[0];
          setDossier(activeDossier as any); 
          if ((activeDossier as any).status as any === 'rejected') {
            setSubmitSuccess(false);
            setTitle((activeDossier as any).title || "");
            setAbstract((activeDossier as any).abstract || "");
          } else {
            setSubmitSuccess(true); 
          }
        }
        setAcceptedRequest(acceptedData);
        setMyRequests(requestsData);
        if (!acceptedData && dossiersData?.length === 0) {
          const themes = await themeService.getThemes();
          setApprovedThemes(themes);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const getStepFromStatus = (status: string) => {
    const steps: Record<string, number> = {
      depose: 2, 
      progres_verifie: 2, 
      plagiat_verifie: 3,
      jury_propose: 4, 
      planifie: 5, 
      delibere: 6, 
      pv_genere: 7, 
      archive: 8,
    };
    return steps[status] || 1;
  };

  const formatDate = (d: string) => d ? new Intl.DateTimeFormat("ar-DZ", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "";


  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTheme) return;
    setIsSendingRequest(true);
    try {
      await supervisionService.requestSupervision(selectedTheme.id, studentMessage);
      const [requestsData] = await Promise.all([supervisionService.getMyRequests()]);
      setMyRequests(requestsData);
      setSelectedTheme(null);
      setStudentMessage("");
    } catch (e: any) {
      alert(e?.response?.data?.message || "حدث خطأ أثناء إرسال الطلب");
    } finally { setIsSendingRequest(false); }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert("يرجى اختيار ملف المذكرة أولاً."); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("file", file);
      const data = await dossierService.submitDossier(formData as any);
      setDossier(data); setSubmitSuccess(true);
    } catch (e: any) {
      alert(e?.response?.data?.message || "حدث خطأ أثناء إرسال الملف.");
    } finally { setIsSubmitting(false); }
  };

  const handleWithdraw = async () => {
    if (!dossier) return;
    if (!confirm("هل أنت متأكد من رغبتك في سحب المذكرة؟ سيتعين عليك إعادة الإيداع لاحقاً.")) return;
    
    setIsSubmitting(true);
    try {
      await dossierService.withdrawDossier(dossier.id);
      setDossier(null);
      setSubmitSuccess(false);
      setFile(null);
      alert("تم سحب المذكرة بنجاح. يمكنك الآن تعديل بياناتك وإعادة الإيداع.");
    } catch (e: any) {
      alert(e?.response?.data?.message || "حدث خطأ أثناء سحب الملف.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasPendingRequest = myRequests.some((r) => r.status === "pending");

  // ─── SCENARIO A: No accepted supervision ───────────────────────────────────
  if (!acceptedRequest && !dossier) {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="hero-banner">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
              <GraduationCap size={32} weight="fill" />
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight">اختر أستاذك المشرف</h1>
              <p className="text-slate-400 text-lg font-medium opacity-80">
                تصفّح المشاريع البحثية المعتمدة وأرسل طلب إشراف
              </p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <WorkflowStepper currentStep={0} />
        </div>

        {/* Pending request notice */}
        {hasPendingRequest && (
          <div className="content-card border-2 border-amber-200 bg-amber-50/30 !p-7 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={28} weight="fill" />
            </div>
            <div className="text-right flex-1">
              <h3 className="font-black text-dark-navy text-lg mb-1">بانتظار رد الأستاذ</h3>
              <p className="text-text-muted font-bold text-sm">لقد أرسلت طلب إشراف وهو قيد المراجعة. يمكنك التحدث مع الأستاذ الآن.</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {myRequests.filter(r => r.status === "pending").map((r) => (
                <div key={r.id} className="text-right p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-dark-navy">{r.theme?.title}</p>
                    <p className="text-xs text-text-muted font-bold">{r.professor?.full_name}</p>
                  </div>
                  <button 
                    onClick={() => setChatRequest(r)}
                    className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <ChatsCircle size={20} weight="fill" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Themes Grid */}
        {approvedThemes.length === 0 ? (
          <div className="content-card text-center py-20">
            <GraduationCap size={64} weight="thin" className="mx-auto text-slate-300 mb-4" />
            <p className="text-text-muted font-bold text-lg">لا توجد مشاريع بحثية متاحة حالياً</p>
            <p className="text-sm text-text-muted mt-2">سيُضيف الأساتذة مشاريعهم قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {approvedThemes.map((theme) => {
              const alreadySent = myRequests.some(r => r.theme_id === theme.id && r.status !== "rejected");
              return (
                <div key={theme.id} className="content-card !p-7 hover:shadow-xl hover:shadow-slate-200/60 transition-all group flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-black text-primary bg-primary-light px-3 py-1 rounded-full">
                      {theme.speciality || "بحث علمي"}
                    </span>
                    <span className="text-xs text-text-muted font-bold">
                      {theme.accepted_count || 0}/{theme.max_students} طالب
                    </span>
                  </div>
                  <h3 className="text-base font-black text-dark-navy group-hover:text-primary transition-colors mb-3 text-right line-clamp-2">
                    {theme.title}
                  </h3>
                  <p className="text-sm text-text-muted font-medium leading-relaxed text-right flex-1 line-clamp-3 mb-5">
                    {theme.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <button
                      disabled={alreadySent || theme.is_full}
                      onClick={() => setSelectedTheme(theme)}
                      className="px-5 py-2.5 bg-primary hover:bg-dark-navy text-white text-sm font-black rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {alreadySent ? "تم الإرسال" : theme.is_full ? "ممتلئ" : "طلب إشراف"}
                    </button>
                    <div className="text-right">
                      <p className="text-xs font-black text-dark-navy">{theme.professor?.full_name}</p>
                      <p className="text-xs text-text-muted font-bold">أستاذ محاضر</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Request Modal */}
        {selectedTheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark-navy/60 backdrop-blur-md" onClick={() => setSelectedTheme(null)} />
            <form onSubmit={handleSendRequest} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-300 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-primary-light text-primary flex items-center justify-center mx-auto">
                  <ChatsCircle size={40} weight="fill" />
                </div>
                <h3 className="text-2xl font-black text-dark-navy">طلب إشراف</h3>
                <p className="font-bold text-primary">{selectedTheme.title}</p>
                <p className="text-sm text-text-muted font-bold">{selectedTheme.professor?.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-black text-dark-navy mb-2">رسالة للأستاذ (اختياري)</label>
                <textarea
                  rows={4}
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  placeholder="قدّم نفسك واشرح اهتمامك بهذا المشروع..."
                  className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-medium text-dark-navy resize-none transition-all text-right"
                />
              </div>
              <button type="submit" disabled={isSendingRequest}
                className="w-full py-5 bg-primary hover:bg-dark-navy text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3">
                {isSendingRequest ? <ArrowsClockwise size={20} className="animate-spin" /> : <ChatsCircle size={22} weight="fill" />}
                {isSendingRequest ? "جاري الإرسال..." : "إرسال طلب الإشراف"}
              </button>
              <button type="button" onClick={() => setSelectedTheme(null)}
                className="w-full py-4 border-2 border-slate-100 text-text-muted font-black rounded-2xl hover:bg-slate-50 transition-all">
                إلغاء
              </button>
            </form>
          </div>
        )}

        {/* Chat Window */}
        {chatRequest && currentUserId && (
          <ChatWindow 
            supervisionRequestId={chatRequest.id}
            currentUserId={currentUserId}
            peerName={chatRequest.professor?.full_name || "الأستاذ"}
            onClose={() => setChatRequest(null)}
          />
        )}
      </div>
    );
  }

  // ─── SCENARIO B: Has accepted supervision — show dossier flow ──────────────
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <Student size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">مسار إيداع المذكرة</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">أكمل خطوات إيداع مذكرتك وتابع حالة تقدمك</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] font-bold text-sm backdrop-blur-sm shadow-xl">
          <span>حالة الملف: {dossier?.status === "depose" ? "تحت المراجعة" : dossier?.status === "progres_verifie" ? "تحت المراجعة (المشرف)" : dossier?.status === "plagiat_verifie" ? "تمت المراجعة" : dossier?.status === "jury_propose" ? "تم تعيين اللجنة" : dossier?.status === "planifie" ? "تمت الجدولة" : dossier?.status === "delibere" ? "تمت المناقشة" : dossier?.status === "pv_genere" ? "تم إصدار المحضر" : dossier?.status === "archive" ? "مؤرشف" : "جاهز للإيداع"}</span>
        </div>
      </div>

      {/* Supervisor card */}
      {acceptedRequest && (
        <div className="content-card !p-6 border-2 border-emerald-200 bg-emerald-50/20 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle size={28} weight="fill" />
          </div>
          <div className="text-right flex-1">
            <p className="text-xs font-black text-emerald-600 uppercase mb-1">المشرف المعتمد</p>
            <h3 className="font-black text-dark-navy text-lg">{acceptedRequest.professor?.full_name}</h3>
            <p className="text-sm text-text-muted font-bold">{acceptedRequest.theme?.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setChatRequest(acceptedRequest)}
              className="px-5 py-2.5 bg-primary hover:bg-dark-navy text-white text-sm font-black rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <ChatsCircle size={18} weight="fill" />
              مراسلة المشرف
            </button>
            <CheckCircle size={32} weight="fill" className="text-emerald-500 shrink-0" />
          </div>
        </div>
      )}

      <div className="content-card">
        <WorkflowStepper currentStep={dossier ? getStepFromStatus(dossier.status) : 1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plagiarism card */}
        <div className="col-span-1 space-y-6">
          <div className="stat-card-premium bg-[#001f2d] !justify-center text-center group">
            <div className="large-icon text-white"><CloudArrowUp size={180} weight="fill" /></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-md text-white rounded-3xl flex items-center justify-center shadow-inner border border-white/10">
                  <CloudArrowUp size={40} weight="fill" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">فحص الاقتباس المبكر</h3>
              <p className="text-base text-white/60 font-medium mb-8 leading-relaxed">فحص تجريبي عبر iThenticate قبل الإيداع النهائي.</p>
            </div>
            {plagiarismScore === null ? (
              <button 
                onClick={() => setIsPlagiarismModalOpen(true)} 
                disabled={!!dossier}
                className="w-full bg-primary hover:bg-dark-navy text-white font-black py-5 rounded-[20px] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <CloudArrowUp size={22} weight="bold" />
                {!!dossier ? "انتهت فترة الفحص" : "بدء الفحص التجريبي"}
              </button>
            ) : (
              <div className={`w-full p-6 rounded-[24px] ${plagiarismScore > 20 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border-2 shadow-inner backdrop-blur-sm`}>
                <div className={`flex items-center justify-center gap-3 ${plagiarismScore > 20 ? 'text-red-400' : 'text-emerald-400'} mb-3 font-black text-4xl`}>
                  {plagiarismScore > 20 ? <WarningCircle size={32} weight="fill" /> : <CheckCircle size={32} weight="fill" />}
                  {plagiarismScore}%
                </div>
                <p className={`text-sm ${plagiarismScore > 20 ? 'text-red-400/80' : 'text-emerald-400/80'} font-bold`}>
                  {plagiarismScore > 20 ? "تنبيه: تجاوزت الحد المسموح به (20%)." : "ممتاز! النسبة ضمن الحد المسموح به."}
                </p>
                {!dossier && (
                  <button onClick={() => setIsPlagiarismModalOpen(true)} className="mt-6 text-sm font-black text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                    <ArrowsClockwise size={16} weight="bold" />
                    إعادة المحاولة
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dossier form / status */}
        <div className="col-span-1 lg:col-span-2">
          <div className="content-card h-full">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-primary-light text-primary rounded-2xl flex items-center justify-center shadow-sm border border-primary/10">
                <FileText size={28} weight="bold" />
              </div>
              <h3 className="text-2xl font-black text-dark-navy">إيداع الملف النهائي</h3>
            </div>

            {submitSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pb-10">
                {dossier?.status === "planifie" ? (
                  <>
                    <div className="w-24 h-24 bg-primary-light text-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/10 border-4 border-white">
                      <ArrowsClockwise size={48} weight="fill" className="animate-spin-slow" />
                    </div>
                    <h4 className="text-3xl font-black text-dark-navy">تمت جدولة مناقشتك!</h4>
                    <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-sm">
                      <div className="p-5 rounded-[24px] bg-slate-50 border-2 border-slate-100">
                        <p className="text-sm text-text-muted font-bold mb-1">الموعد</p>
                        <p className="text-base font-black text-primary">{formatDate(dossier?.soutenances?.[0]?.date_soutenance)}</p>
                      </div>
                      <div className="p-5 rounded-[24px] bg-slate-50 border-2 border-slate-100">
                        <p className="text-sm text-text-muted font-bold mb-1">المكان</p>
                        <p className="text-base font-black text-primary">{dossier?.soutenances?.[0]?.salle || "لم يحدد بعد"}</p>
                      </div>
                    </div>
                  </>
                ) : dossier?.status === "delibere" || dossier?.status === "pv_genere" || dossier?.status === "archive" ? (
                  <div className="w-full space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 bg-success-light text-success rounded-full flex items-center justify-center shadow-xl shadow-success/10 border-4 border-white mx-auto relative">
                      <CheckCircle size={48} weight="fill" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-3xl font-black text-dark-navy">تمت المناقشة بنجاح</h4>
                      <p className="text-text-muted font-bold text-lg">مبروك! لقد أتممت مسارك الأكاديمي بنجاح.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto pt-4">
                      <div className="p-8 rounded-[32px] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-200/20 rounded-full -translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700" />
                        <div className="relative z-10 text-right">
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">النتيجة النهائية</p>
                          <div className="flex items-baseline justify-end gap-2">
                            <span className="text-5xl font-black text-emerald-700 leading-none">
                              {dossier?.soutenances?.[0]?.deliberations?.[0]?.note || "--"}
                            </span>
                            <span className="text-xl font-bold text-emerald-600/40">/ 20</span>
                          </div>
                          {dossier?.soutenances?.[0]?.deliberations?.[0]?.mention && (
                            <div className="mt-4 inline-flex px-4 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-black shadow-md shadow-emerald-200">
                              بتقدير: {dossier?.soutenances?.[0]?.deliberations?.[0]?.mention}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-8 rounded-[32px] bg-slate-50 border-2 border-slate-100 shadow-sm text-right relative group">
                        <Quotes size={32} weight="fill" className="absolute top-6 left-6 text-slate-200 group-hover:text-primary/20 transition-colors" />
                        <div className="relative z-10">
                          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">ملاحظات اللجنة</p>
                          <p className="text-base font-bold text-dark-navy leading-relaxed italic">
                            "{dossier?.soutenances?.[0]?.deliberations?.[0]?.observations || "لا توجد ملاحظات إضافية مسجلة حالياً."}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Final PV Download Section */}
                    {(dossier?.status === "pv_genere" || dossier?.status === "archive") && dossier?.soutenances?.[0]?.pv_url && (
                      <div className="w-full max-w-2xl mx-auto mt-8 p-1 rounded-[32px] bg-gradient-to-r from-primary to-dark-navy shadow-xl shadow-primary/20 animate-in slide-in-from-bottom-6 duration-1000 delay-300">
                        <div className="bg-white rounded-[31px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-primary-light text-primary rounded-2xl flex items-center justify-center shadow-inner border border-primary/10 shrink-0">
                               <FilePdf size={32} weight="fill" />
                            </div>
                            <div className="text-right">
                              <h5 className="text-lg font-black text-dark-navy">محضر المناقشة النهائي</h5>
                              <p className="text-sm text-text-muted font-bold">موقّع رقمياً ومعتمد من اللجنة (PAdES)</p>
                            </div>
                          </div>
                          <a 
                            href={dossier?.soutenances?.[0]?.pv_url} 
                            target="_blank"
                            className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-dark-navy text-white font-black rounded-2xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 whitespace-nowrap"
                          >
                            <DownloadSimple size={20} weight="bold" />
                            تحميل المحضر
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-success-light text-success rounded-full flex items-center justify-center shadow-xl shadow-success/10 border-4 border-white">
                      <CheckCircle size={48} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-dark-navy">تم الإيداع بنجاح</h4>
                      <p className="text-lg text-text-muted font-bold mt-2">
                        {dossier?.status === "depose" ? "تم إيداع مذكرتك وهي قيد المراجعة حالياً." : dossier?.status === "progres_verifie" ? "قام المشرف بمراجعة المذكرة، بانتظار فحص الاقتباس النهائي." : dossier?.status === "plagiat_verifie" ? "تمت المراجعة وفحص الاقتباس بنجاح، بانتظار تعيين اللجنة." : dossier?.status === "jury_propose" ? "تم تعيين اللجنة، بانتظار الجدولة." : "جاري معالجة طلبك."}
                      </p>
                    </div>
                    {dossier?.status === "depose" && (
                      <button
                        onClick={handleWithdraw}
                        disabled={isSubmitting}
                        className="mt-4 px-8 py-3 border-2 border-red-100 text-red-600 font-black rounded-2xl hover:bg-red-50 transition-all flex items-center gap-2"
                      >
                        <ArrowsClockwise size={20} className={isSubmitting ? "animate-spin" : ""} />
                        سحب المذكرة
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleFinalSubmit} className="space-y-8">
                {dossier?.status === 'rejected' && (
                  <div className="p-6 rounded-[24px] bg-danger-light border-2 border-danger/20 flex items-center gap-5 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-danger text-white flex items-center justify-center shrink-0 shadow-lg shadow-danger/20">
                      <WarningCircle size={24} weight="fill" />
                    </div>
                    <div className="text-right">
                      <h4 className="text-lg font-black text-danger mb-1">تم رفض الملف من قبل المشرف</h4>
                      <p className="text-sm text-danger/80 font-bold">يرجى مراجعة ملاحظات المشرف عبر الدردشة، تعديل المذكرة، ثم إعادة رفعها مرة أخرى.</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-base font-black text-dark-navy mb-3">عنوان المذكرة</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-6 py-5 rounded-[20px] border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary-light focus:border-primary transition-all outline-none text-base font-bold text-dark-navy shadow-inner"
                    placeholder="أدخل العنوان الكامل للمذكرة..." />
                </div>
                <div>
                  <label className="block text-base font-black text-dark-navy mb-3">الملخص</label>
                  <textarea required value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={4}
                    className="w-full px-6 py-5 rounded-[20px] border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary-light focus:border-primary transition-all outline-none text-base font-bold text-dark-navy resize-none shadow-inner"
                    placeholder="اكتب ملخص المذكرة هنا..." />
                </div>
                <div>
                  <label className="block text-base font-black text-dark-navy mb-3">ملف المذكرة (PDF)</label>
                  <label className="border-4 border-dashed border-slate-50 rounded-[40px] p-16 text-center hover:bg-primary-light/20 hover:border-primary transition-all cursor-pointer group bg-slate-50/30 block relative">
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-16 h-16 bg-white text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform">
                      <FilePdf size={32} weight="fill" />
                    </div>
                    <p className="text-lg font-black text-dark-navy mb-2">{file ? file.name : "اسحب وأفلت الملف هنا"}</p>
                    <p className="text-sm text-text-muted font-bold">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "أو اضغط لاختيار ملف (PDF حتى 50MB)"}</p>
                  </label>
                </div>
                <button type="submit" disabled={isSubmitting || !!plagiarismScore}
                  className="w-full py-6 rounded-[24px] bg-primary hover:bg-dark-navy text-white text-lg font-black transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                  {isSubmitting ? "جاري الإرسال..." : "إرسال للمراجعة النهائية"}
                </button>
                {!!plagiarismScore && (
                  <p className="text-sm text-danger text-center font-black flex items-center justify-center gap-2">
                    <WarningCircle size={18} weight="bold" />يرجى معالجة تنبيه الاقتباس قبل الإيداع.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {chatRequest && currentUserId && (
        <ChatWindow 
          supervisionRequestId={chatRequest.id}
          currentUserId={currentUserId}
          peerName={chatRequest.professor?.full_name || "الأستاذ المشرف"}
          onClose={() => setChatRequest(null)}
        />
      )}
      {/* Plagiarism Modal */}
      <PlagiarismModal 
        isOpen={isPlagiarismModalOpen}
        onClose={() => setIsPlagiarismModalOpen(false)}
        onComplete={(score) => {
          setPlagiarismScore(score);
          setIsPlagiarismModalOpen(false);
        }}
      />
    </div>
  );
}
