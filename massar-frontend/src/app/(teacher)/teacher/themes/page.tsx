"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Trash,
  ArrowsClockwise,
  Student as StudentIcon,
  Check,
  X,
  Warning,
  ChatsCircle,
  GraduationCap,
} from "@phosphor-icons/react";
import { themeService } from "@/services/themeService";
import { supervisionService } from "@/services/supervisionService";
import { ChatWindow } from "@/components/ui/ChatWindow";
import { getCurrentUser } from "@/lib/auth";

type ThemeStatus = "pending_admin" | "approved" | "rejected";
type RequestStatus = "pending" | "accepted" | "rejected";

const STATUS_CONFIG: Record<ThemeStatus, { label: string; className: string }> = {
  pending_admin: {
    label: "بانتظار موافقة الإدارة",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  approved: {
    label: "معتمد",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  rejected: {
    label: "مرفوض",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
};

const REQ_STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  pending: {
    label: "معلق",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  accepted: {
    label: "مقبول",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  rejected: {
    label: "مرفوض",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
};

export default function TeacherThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"themes" | "requests">("themes");

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSpeciality, setFormSpeciality] = useState("");
  const [formMaxStudents, setFormMaxStudents] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Review request modal
  const [reviewingRequest, setReviewingRequest] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Chat state
  const [chatRequest, setChatRequest] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [themesData, requestsData] = await Promise.all([
        themeService.getThemes(),
        supervisionService.getMyRequests(),
      ]);
      setThemes(themesData);
      setRequests(requestsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc) return;
    setIsCreating(true);
    try {
      await themeService.createTheme({
        title: formTitle,
        description: formDesc,
        speciality: formSpeciality || undefined,
        max_students: formMaxStudents,
      });
      setShowForm(false);
      setFormTitle("");
      setFormDesc("");
      setFormSpeciality("");
      setFormMaxStudents(1);
      await fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.message || "حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    try {
      await themeService.deleteTheme(id);
      await fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.message || "لا يمكن حذف هذا المشروع");
    }
  };

  const handleReviewRequest = async (action: "accept" | "reject") => {
    if (!reviewingRequest) return;
    setIsReviewing(true);
    try {
      await supervisionService.reviewRequest(reviewingRequest.id, action, feedback);
      setReviewingRequest(null);
      setFeedback("");
      await fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.message || "حدث خطأ أثناء المراجعة");
    } finally {
      setIsReviewing(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedThemes = themes.filter((t) => t.status === "approved").length;
  const pendingThemes = themes.filter((t) => t.status === "pending_admin").length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <GraduationCap size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">مشاريعي البحثية وطلبات الإشراف</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">
              أنشئ مشاريعك البحثية وراجع طلبات الطلاب للإشراف
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl disabled:opacity-50"
        >
          <span>تحديث</span>
          <ArrowsClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-premium group bg-premium-blue">
          <div className="large-icon text-white">
            <BookOpen size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{themes.length}</div>
            <div className="text-white/60 font-bold text-sm">إجمالي المشاريع</div>
          </div>
        </div>
        <div className="stat-card-premium group bg-premium-emerald">
          <div className="large-icon text-white">
            <CheckCircle size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{approvedThemes}</div>
            <div className="text-white/60 font-bold text-sm">مشاريع معتمدة</div>
          </div>
        </div>
        <div className="stat-card-premium group bg-premium-amber">
          <div className="large-icon text-white">
            <StudentIcon size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{pendingRequests.length}</div>
            <div className="text-white/60 font-bold text-sm">طلبات إشراف معلقة</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-100 pb-0">
        {[
          { key: "themes", label: "مشاريعي البحثية", count: themes.length },
          { key: "requests", label: "طلبات الإشراف", count: pendingRequests.length, badge: true },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`relative flex items-center gap-2 px-6 py-4 font-black text-sm transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-primary border-primary"
                : "text-text-muted border-transparent hover:text-dark-navy"
            }`}
          >
            {tab.label}
            {tab.badge && tab.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-black">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab: Themes ─── */}
      {activeTab === "themes" && (
        <div className="space-y-6">
          {/* Create Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-3 bg-primary hover:bg-dark-navy text-white px-7 py-4 rounded-[20px] font-black text-sm transition-all shadow-xl shadow-primary/20"
            >
              <Plus size={20} weight="bold" />
              إنشاء مشروع جديد
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <form
              onSubmit={handleCreateTheme}
              className="content-card border-2 border-primary/10 space-y-6 animate-in slide-in-from-top-2 duration-300"
            >
              <h3 className="text-xl font-black text-dark-navy">مشروع بحثي جديد</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-dark-navy mb-2">عنوان المشروع *</label>
                  <input
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: الذكاء الاصطناعي في الطب..."
                    className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-bold text-dark-navy transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-dark-navy mb-2">وصف تفصيلي *</label>
                  <textarea
                    required
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="اكتب وصفاً تفصيلياً للمشروع وأهدافه..."
                    className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-bold text-dark-navy resize-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-dark-navy mb-2">التخصص</label>
                  <input
                    value={formSpeciality}
                    onChange={(e) => setFormSpeciality(e.target.value)}
                    placeholder="مثال: ماستر ذكاء اصطناعي"
                    className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-bold text-dark-navy transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-dark-navy mb-2">الحد الأقصى للطلاب</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formMaxStudents}
                    onChange={(e) => setFormMaxStudents(parseInt(e.target.value))}
                    className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-bold text-dark-navy transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-4 bg-primary hover:bg-dark-navy text-white font-black rounded-[16px] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? <ArrowsClockwise size={20} className="animate-spin" /> : <Check size={20} weight="bold" />}
                  {isCreating ? "جاري الإنشاء..." : "إنشاء المشروع"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 border-2 border-slate-100 text-text-muted font-black rounded-[16px] hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Themes List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : themes.length === 0 ? (
            <div className="content-card text-center py-20 space-y-4">
              <BookOpen size={64} weight="thin" className="mx-auto text-slate-300" />
              <p className="text-text-muted font-bold text-lg">لم تنشئ أي مشروع بعد</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 text-primary font-black hover:underline"
              >
                <Plus size={18} weight="bold" /> إنشاء أول مشروع
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="content-card !p-7 hover:shadow-xl hover:shadow-slate-200/60 transition-all group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full ${STATUS_CONFIG[theme.status as ThemeStatus].className}`}>
                      {STATUS_CONFIG[theme.status as ThemeStatus].label}
                    </span>
                    <button
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-danger hover:bg-red-50 transition-all"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-dark-navy mb-2 text-right">{theme.title}</h3>
                  <p className="text-sm text-text-muted font-medium leading-relaxed text-right mb-5 line-clamp-2">
                    {theme.description}
                  </p>

                  {theme.speciality && (
                    <div className="flex justify-end">
                      <span className="text-xs font-black text-primary bg-primary-light px-3 py-1 rounded-full">
                        {theme.speciality}
                      </span>
                    </div>
                  )}

                  {theme.status === "rejected" && theme.admin_feedback && (
                    <div className="mt-4 p-4 rounded-[16px] bg-red-50 border border-red-100">
                      <p className="text-xs font-bold text-red-600 flex items-start gap-2">
                        <Warning size={16} weight="fill" className="shrink-0 mt-0.5" />
                        {theme.admin_feedback}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-text-muted font-bold">
                      {new Date(theme.created_at).toLocaleDateString("ar-DZ")}
                    </span>
                    <span className="text-xs font-black text-text-muted">
                      الطلاب: {theme.accepted_count || 0}/{theme.max_students}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Requests ─── */}
      {activeTab === "requests" && (
        <div className="content-card overflow-hidden !p-0">
          <div className="px-10 py-7 border-b border-slate-50">
            <h3 className="text-2xl font-black text-dark-navy">طلبات الإشراف الواردة</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center">
              <ChatsCircle size={64} weight="thin" className="mx-auto text-slate-300 mb-4" />
              <p className="text-text-muted font-bold">لا توجد طلبات إشراف حتى الآن</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {requests.map((req) => (
                <div key={req.id} className="px-10 py-7 flex items-center gap-6 hover:bg-slate-50/40 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-black text-lg shrink-0">
                    {req.student?.full_name?.charAt(0) || "ط"}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-black text-dark-navy">{req.student?.full_name || "طالب"}</div>
                    <div className="text-sm text-text-muted font-bold mt-0.5">
                      المشروع: {req.theme?.title}
                    </div>
                    {req.student_message && (
                      <div className="text-sm text-text-muted mt-2 italic">"{req.student_message}"</div>
                    )}
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full shrink-0 ${REQ_STATUS_CONFIG[req.status as RequestStatus].className}`}>
                    {REQ_STATUS_CONFIG[req.status as RequestStatus].label}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Chat button — available for pending requests */}
                    {(req.status === "pending" || req.status === "accepted") && (
                      <button
                        onClick={() => setChatRequest(req)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-primary hover:text-white text-dark-navy text-sm font-black rounded-xl transition-all flex items-center gap-2"
                      >
                        <ChatsCircle size={16} weight="fill" />
                        محادثة
                      </button>
                    )}
                    {/* Review button — pending only */}
                    {req.status === "pending" && (
                      <button
                        onClick={() => { setReviewingRequest(req); setFeedback(""); }}
                        className="px-5 py-2.5 bg-primary hover:bg-dark-navy text-white text-sm font-black rounded-xl transition-all"
                      >
                        مراجعة
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Review Modal ─── */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-navy/60 backdrop-blur-md" onClick={() => setReviewingRequest(null)} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-300 space-y-7">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-primary-light text-primary flex items-center justify-center mx-auto">
                <StudentIcon size={40} weight="fill" />
              </div>
              <h3 className="text-2xl font-black text-dark-navy">مراجعة طلب الإشراف</h3>
              <p className="text-text-muted font-bold">
                الطالب: <span className="text-dark-navy">{reviewingRequest.student?.full_name}</span>
              </p>
              <p className="text-text-muted font-bold text-sm">
                المشروع: <span className="text-primary">{reviewingRequest.theme?.title}</span>
              </p>
              {reviewingRequest.student_message && (
                <div className="p-4 bg-slate-50 rounded-2xl text-sm text-text-muted italic text-right">
                  "{reviewingRequest.student_message}"
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-black text-dark-navy mb-2">
                ملاحظة (اختيارية)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="أضف ملاحظة للطالب (اختياري)..."
                className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-medium text-dark-navy resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleReviewRequest("accept")}
                disabled={isReviewing}
                className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check size={20} weight="bold" /> قبول
              </button>
              <button
                onClick={() => handleReviewRequest("reject")}
                disabled={isReviewing}
                className="py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X size={20} weight="bold" /> رفض
              </button>
            </div>

            {/* Open chat from inside modal */}
            <button
              onClick={() => { setChatRequest(reviewingRequest); setReviewingRequest(null); }}
              className="w-full py-4 border-2 border-slate-100 text-primary font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ChatsCircle size={20} weight="fill" />
              فتح محادثة مع الطالب
            </button>

            <button
              onClick={() => setReviewingRequest(null)}
              className="w-full py-3 text-text-muted font-black hover:underline text-sm transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ─── Chat Window ─── */}
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
