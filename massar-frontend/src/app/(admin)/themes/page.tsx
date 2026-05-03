"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  MagnifyingGlass,
  Warning,
  Check,
  X,
  FunnelSimple,
  GraduationCap,
  ClockAfternoon,
} from "@phosphor-icons/react";
import { themeService } from "@/services/themeService";

type ThemeStatus = "pending_admin" | "approved" | "rejected";

const STATUS_CONFIG: Record<ThemeStatus, { label: string; className: string; icon: any }> = {
  pending_admin: {
    label: "بانتظار الموافقة",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: ClockAfternoon,
  },
  approved: {
    label: "معتمد",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "مرفوض",
    className: "bg-red-50 text-red-600 border border-red-200",
    icon: XCircle,
  },
};

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ThemeStatus | "all">("pending_admin");
  const [search, setSearch] = useState("");

  // Review modal
  const [reviewingTheme, setReviewingTheme] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const data = await themeService.getThemes(filter === "all" ? undefined : filter);
      setThemes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [filter]);

  const handleReview = async (action: "approve" | "reject") => {
    if (!reviewingTheme) return;
    if (action === "reject" && !feedback.trim()) {
      alert("يرجى كتابة ملاحظة عند الرفض.");
      return;
    }
    setIsReviewing(true);
    try {
      await themeService.reviewTheme(reviewingTheme.id, action, feedback || undefined);
      setReviewingTheme(null);
      setFeedback("");
      await fetchThemes();
    } catch (e: any) {
      alert(e?.response?.data?.message || "حدث خطأ");
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredThemes = themes.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.professor?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pending = themes.filter((t) => t.status === "pending_admin").length;
  const approved = themes.filter((t) => t.status === "approved").length;
  const rejected = themes.filter((t) => t.status === "rejected").length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <GraduationCap size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">مراجعة المشاريع البحثية</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">
              راجع وأقرّ المشاريع التي يقترحها الأساتذة للطلاب
            </p>
          </div>
        </div>
        <button
          onClick={fetchThemes}
          disabled={loading}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl disabled:opacity-50"
        >
          <span>تحديث</span>
          <ArrowsClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-premium group bg-premium-amber">
          <div className="large-icon text-white">
            <ClockAfternoon size={160} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{pending}</div>
            <div className="text-white/60 font-bold text-sm">بانتظار الموافقة</div>
          </div>
        </div>
        <div className="stat-card-premium group bg-premium-emerald">
          <div className="large-icon text-white">
            <CheckCircle size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{approved}</div>
            <div className="text-white/60 font-bold text-sm">مشاريع معتمدة</div>
          </div>
        </div>
        <div className="stat-card-premium group bg-premium-indigo">
          <div className="large-icon text-white">
            <BookOpen size={180} weight="fill" />
          </div>
          <div className="text-right relative z-10">
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{themes.length}</div>
            <div className="text-white/60 font-bold text-sm">إجمالي المشاريع</div>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالعنوان أو اسم الأستاذ..."
            className="w-full pr-12 pl-5 py-4 rounded-[16px] border-2 border-slate-100 bg-white font-bold text-dark-navy outline-none focus:border-primary transition-all text-right"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { val: "pending_admin", label: "معلق" },
            { val: "approved", label: "مقبول" },
            { val: "rejected", label: "مرفوض" },
            { val: "all", label: "الكل" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilter(f.val as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[14px] font-black text-sm transition-all border-2 ${
                filter === f.val
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-text-muted border-slate-100 hover:border-primary/30"
              }`}
            >
              <FunnelSimple size={14} weight="bold" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Themes Table */}
      <div className="content-card overflow-hidden !p-0">
        <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-2xl font-black text-dark-navy">
            قائمة المشاريع
            {filter !== "all" && (
              <span className="mr-2 text-base text-text-muted font-bold">
                — {STATUS_CONFIG[filter as ThemeStatus]?.label}
              </span>
            )}
          </h3>
          <span className="text-sm font-bold text-text-muted">
            {filteredThemes.length} مشروع
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="py-24 text-center">
            <BookOpen size={64} weight="thin" className="mx-auto text-slate-300 mb-4" />
            <p className="text-text-muted font-bold text-lg">لا توجد مشاريع في هذه الفئة</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredThemes.map((theme) => {
              const cfg = STATUS_CONFIG[theme.status as ThemeStatus];
              const Icon = cfg?.icon || BookOpen;
              return (
                <div
                  key={theme.id}
                  className="px-10 py-7 hover:bg-slate-50/40 transition-colors group"
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center shrink-0 mt-1">
                      <GraduationCap size={28} weight="fill" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-right min-w-0">
                      <div className="flex items-center justify-end gap-3 mb-2 flex-wrap">
                        <h4 className="text-lg font-black text-dark-navy group-hover:text-primary transition-colors">
                          {theme.title}
                        </h4>
                        <span className={`text-xs font-black px-3 py-1 rounded-full shrink-0 ${cfg?.className}`}>
                          {cfg?.label}
                        </span>
                      </div>

                      <p className="text-sm text-text-muted font-medium leading-relaxed mb-3 line-clamp-2">
                        {theme.description}
                      </p>

                      <div className="flex items-center justify-end gap-6 flex-wrap">
                        <span className="text-xs font-bold text-text-muted">
                          الأستاذ: <span className="text-dark-navy">{theme.professor?.full_name}</span>
                        </span>
                        {theme.speciality && (
                          <span className="text-xs font-black text-primary bg-primary-light px-2.5 py-1 rounded-full">
                            {theme.speciality}
                          </span>
                        )}
                        <span className="text-xs font-bold text-text-muted">
                          {new Date(theme.created_at).toLocaleDateString("ar-DZ")}
                        </span>
                      </div>

                      {theme.status === "rejected" && theme.admin_feedback && (
                        <div className="mt-3 p-3 rounded-[12px] bg-red-50 border border-red-100 inline-block">
                          <p className="text-xs font-bold text-red-600 flex items-center gap-2">
                            <Warning size={14} weight="fill" />
                            {theme.admin_feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {theme.status === "pending_admin" && (
                      <button
                        onClick={() => { setReviewingTheme(theme); setFeedback(""); }}
                        className="shrink-0 px-6 py-3 bg-primary hover:bg-dark-navy text-white text-sm font-black rounded-xl transition-all shadow-md shadow-primary/20"
                      >
                        مراجعة
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Review Modal ─── */}
      {reviewingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark-navy/60 backdrop-blur-md"
            onClick={() => setReviewingTheme(null)}
          />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-300 space-y-7">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-primary-light text-primary flex items-center justify-center mx-auto">
                <GraduationCap size={40} weight="fill" />
              </div>
              <h3 className="text-2xl font-black text-dark-navy">مراجعة المشروع</h3>
              <p className="text-xl font-bold text-primary">{reviewingTheme.title}</p>
              <p className="text-sm text-text-muted font-bold">
                الأستاذ: {reviewingTheme.professor?.full_name}
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl text-sm text-text-muted text-right leading-relaxed">
                {reviewingTheme.description}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-dark-navy mb-2">
                ملاحظات (مطلوبة عند الرفض)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="سبب الرفض أو ملاحظة للأستاذ..."
                className="w-full px-5 py-4 rounded-[16px] border-2 border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none font-medium text-dark-navy resize-none transition-all text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleReview("approve")}
                disabled={isReviewing}
                className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                <Check size={20} weight="bold" />
                قبول المشروع
              </button>
              <button
                onClick={() => handleReview("reject")}
                disabled={isReviewing}
                className="py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                <X size={20} weight="bold" />
                رفض المشروع
              </button>
            </div>
            <button
              onClick={() => setReviewingTheme(null)}
              className="w-full py-4 border-2 border-slate-100 text-text-muted font-black rounded-2xl hover:bg-slate-50 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
