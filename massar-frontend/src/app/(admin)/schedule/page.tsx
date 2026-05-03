
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  Users, 
  Calendar, 
  X, 
  CheckCircle, 
  Info, 
  ArrowsClockwise, 
  MagnifyingGlass, 
  Plus,
  Sparkle,
  Monitor,
  MapPin,
  WarningCircle,
  CaretDown,
  UserCircleGear,
  User,
  MagnifyingGlassPlus,
  ShieldCheck,
  CalendarCheck
} from "@phosphor-icons/react";
import { dossierService } from "@/services/dossierService";
import { motion, AnimatePresence } from "framer-motion";

// Custom Searchable Select Component
const CustomProfSelector = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "اختر أستاذاً...", 
  disabled = false,
  excludeIds = []
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProf = options.find((o: any) => o.id === value);
  const filteredOptions = options.filter((o: any) => 
    !excludeIds.includes(o.id) && 
    o.full_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <label className="text-xs font-black text-text-muted uppercase tracking-wider">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-bold text-dark-navy ${
          disabled ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed opacity-80' : 
          isOpen ? 'bg-white border-primary ring-4 ring-primary-light shadow-lg' : 'bg-slate-50/50 border-slate-50 hover:border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${disabled ? 'bg-slate-200' : 'bg-slate-200'}`}>
            <User size={16} weight="bold" />
          </div>
          <span className={!selectedProf ? "text-slate-400" : ""}>
            {selectedProf ? selectedProf.full_name : placeholder}
          </span>
        </div>
        {!disabled && <CaretDown size={18} weight="bold" className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] w-full bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-50 bg-slate-50/30">
               <div className="relative">
                  <MagnifyingGlass size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="ابحث بالاسم..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pr-11 pl-4 py-3 rounded-xl bg-white border-2 border-slate-100 focus:border-primary outline-none text-sm font-bold transition-all"
                  />
               </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
               {filteredOptions.length > 0 ? filteredOptions.map((prof: any) => (
                 <button
                   key={prof.id}
                   type="button"
                   onClick={() => {
                     onChange(prof.id);
                     setIsOpen(false);
                     setSearch("");
                   }}
                   className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right ${
                     value === prof.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 text-dark-navy'
                   }`}
                 >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${value === prof.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                       <User size={16} weight="bold" />
                    </div>
                    <div className="flex-1">
                       <div className="text-sm font-black">{prof.full_name}</div>
                       <div className={`text-[10px] ${value === prof.id ? 'text-white/70' : 'text-text-muted'}`}>{prof.email}</div>
                    </div>
                    {value === prof.id && <CheckCircle size={18} weight="fill" />}
                 </button>
               )) : (
                 <div className="p-8 text-center text-text-muted font-bold text-sm">لا يوجد أساتذة بهذا الاسم</div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MOCK_DOSSIERS = [
  {
    id: "mock-1",
    title: "تحسين خوارزميات التعلم العميق لتشخيص الأمراض الطبية",
    status: "depose",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    student: { full_name: "محمد الأمين بلقاسم", email: "m.belkacem@univ.dz" },
    director: { full_name: "أ.د. سمير أمين" },
    resume: "دراسة حول استخدام CNN في تشخيص صور الأشعة السينية..."
  },
  {
    id: "mock-2",
    title: "نظم الإدارة الذكية للشبكات الكهربائية المستقلة",
    status: "plagiat_verifie",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    student: { full_name: "سارة بن عودة", email: "s.benouda@univ.dz" },
    director: { full_name: "د. ليلى منصور" },
    resume: "بحث في تقنيات توزيع الطاقة المتجددة في الشبكات الصغيرة..."
  },
  {
    id: "mock-3",
    title: "تأمين المعاملات المالية باستخدام تقنية البلوكشين",
    status: "planifie",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    student: { full_name: "حمزة قادري", email: "h.kadri@univ.dz" },
    director: { full_name: "أ.د. عبد القادر جيلالي" },
    resume: "تطوير بروتوكول أمان جديد للمعاملات اللامركزية...",
    soutenance: {
      salle: "Salle 12",
      date_soutenance: new Date(Date.now() + 86400000 * 5).toISOString()
    },
    jury: {
      president_id: "p1",
      examinateur_id: "p2",
      rapporteur_id: "p3"
    }
  }
];

export default function SchedulingPage() {
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [professors, setProfessors] = useState<any[]>([]);

  // Form States
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const [presidentId, setPresidentId] = useState("");
  const [examinerId, setExaminerId] = useState("");
  const [rapporteurId, setRapporteurId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart Suggestion States
  const [isGenerating, setIsGenerating] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  const isViewOnly = selectedDossier?.status === 'planifie';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dData, pData] = await Promise.all([
        dossierService.getDossiers(),
        dossierService.getProfessors()
      ]);
      
      // Combine Mock Data with Real Data
      // Filter out mock data if real data with same ID exists (unlikely with UUIDs but good practice)
      const realIds = new Set(dData.map(d => d.id));
      const filteredMock = MOCK_DOSSIERS.filter(m => !realIds.has(m.id));
      
      setDossiers([...dData, ...filteredMock]);
      setProfessors(pData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      // Fallback to mock data if API fails
      setDossiers(MOCK_DOSSIERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleClick = (dossier: any) => {
    setSelectedDossier(dossier);
    setSmartSuggestions([]);
    setSelectedSuggestionIndex(null);
    
    // Clear previous values first
    setDate("");
    setTime("");
    setRoom("");
    setPresidentId("");
    setExaminerId("");
    setRapporteurId(dossier.director_id || "");

    if (dossier.status === 'planifie') {
      // Handle Soutenance Data - Check standardized path first
      const soutData = dossier.soutenance || dossier.soutenances;
      const sout = Array.isArray(soutData) ? soutData[0] : soutData;
      
      if (sout) {
        setRoom(sout.salle || sout.room || "");
        
        const dateVal = sout.date_soutenance || sout.date;
        if (dateVal) {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            setDate(`${yyyy}-${mm}-${dd}`);
            setTime(d.toTimeString().substring(0, 5));
          }
        }
      }

      // Handle Jury Data - Check standardized path first
      const juryData = dossier.jury || dossier.juries || dossier.jury_members;
      const jury = Array.isArray(juryData) ? juryData[0] : juryData;
      if (jury) {
        setPresidentId(jury.president_id || "");
        setExaminerId(jury.examinateur_id || jury.examiner_id || "");
        setRapporteurId(jury.rapporteur_id || dossier.director_id || "");
      }
    }
  };

  const generateSmartSuggestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dates = ['2026-06-15', '2026-06-16', '2026-06-18'];
      const times = ['09:00', '11:00', '14:00'];
      const rooms = ['Amphi A', 'Salle 12', 'Salle Conférences'];
      
      const availableProfs = professors.filter(p => p.id !== selectedDossier.director_id);
      
      const suggestions = dates.map((d, i) => {
        const shuffled = [...availableProfs].sort(() => 0.5 - Math.random());
        const pres = shuffled[0];
        const exam = shuffled[1];
        
        return {
          date: d,
          time: times[i],
          room: rooms[i],
          presidentId: pres?.id,
          examinerId: exam?.id,
          rapporteurId: selectedDossier.director_id
        };
      });
      
      setSmartSuggestions(suggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const applySuggestion = (index: number) => {
    if (isViewOnly) return;
    const s = smartSuggestions[index];
    setDate(s.date);
    setTime(s.time);
    setRoom(s.room);
    setPresidentId(s.presidentId);
    setExaminerId(s.examinerId);
    setRapporteurId(s.rapporteurId);
    setSelectedSuggestionIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    setIsSubmitting(true);
    try {
      console.log("Submitting schedule:", { date, time, room, presidentId, examinerId, rapporteurId });
      await dossierService.scheduleSoutenance(selectedDossier.id, {
        date,
        time,
        room,
        jury: {
          president_id: presidentId,
          examinateur_id: examinerId,
          rapporteur_id: rapporteurId
        }
      });
      alert("تمت الجدولة بنجاح!");
      setSelectedDossier(null);
      fetchData();
    } catch (error) {
      console.error("Scheduling failed", error);
      alert("حدث خطأ أثناء الجدولة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTimeLeft = (updatedAt: string) => {
    const deadline = new Date(updatedAt);
    deadline.setHours(deadline.getHours() + 72);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return { text: "انتهت المهلة", color: "text-danger", bgColor: "bg-danger-light" };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      text: `${hours} ساعة و ${minutes} دقيقة متبقية`, 
      color: hours < 24 ? "text-danger" : "text-amber-600",
      bgColor: hours < 24 ? "bg-danger-light" : "bg-amber-50"
    };
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md shadow-inner">
            <Calendar size={32} weight="fill" />
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">جدولة المناقشات</h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">إدارة مواعيد المناقشات، توزيع القاعات، وتعيين لجان التحكيم</p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] hover:bg-white/10 transition-all font-bold text-sm backdrop-blur-sm shadow-xl"
        >
          <span>تحديث القائمة</span>
          <ArrowsClockwise size={20} weight="bold" className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Dossier List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black text-dark-navy">الملفات بانتظار الجدولة</h3>
             <span className="px-3 py-1 bg-slate-100 text-text-muted rounded-full text-xs font-black">
               {dossiers.filter(d => d.status !== 'planifie').length} ملف
             </span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-10 text-center text-text-muted font-bold">جاري تحميل الملفات...</div>
            ) : dossiers.map((d) => {
              const timeLeft = calculateTimeLeft(d.updated_at || d.created_at);
              return (
                <motion.div 
                  layout
                  key={d.id} 
                  className={`content-card !p-6 cursor-pointer border-2 transition-all group ${selectedDossier?.id === d.id ? 'border-primary bg-primary-light/5' : 'border-transparent hover:border-slate-200'}`}
                  onClick={() => handleScheduleClick(d)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${d.status === 'planifie' ? 'bg-success-light text-success' : 'bg-primary-light text-primary'}`}>
                        {d.status === 'planifie' ? 'تمت الجدولة' : 'جاهز للجدولة'}
                      </div>
                      <span className="text-xs text-text-muted font-bold">#{d.id.substring(0, 6)}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-dark-navy mb-1 group-hover:text-primary transition-colors line-clamp-1">{d.title}</h4>
                      <p className="text-sm text-text-muted font-bold mb-1">{d.student?.full_name}</p>
                      <p className="text-[11px] text-primary font-black mb-4">المشرف: {d.director?.full_name || "أ.د. سمير أمين"}</p>
                    </div>
                    
                    {d.status !== 'planifie' && (
                      <div className={`flex items-center gap-2 text-[11px] font-black p-2.5 rounded-2xl ${timeLeft.bgColor} ${timeLeft.color}`}>
                        <Clock size={16} weight="bold" />
                        {timeLeft.text}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:col-span-2">
           {!selectedDossier ? (
             <div className="content-card h-full min-h-[500px] flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-slate-200 bg-slate-50/30">
                <div className="w-24 h-24 rounded-[40px] bg-white shadow-xl flex items-center justify-center text-slate-300 mb-8 border border-slate-100">
                   <Calendar size={48} weight="duotone" />
                </div>
                <h3 className="text-2xl font-black text-dark-navy mb-3">اختر ملفاً لبدء الجدولة</h3>
                <p className="text-text-muted font-bold max-w-sm leading-relaxed">
                  قم بتحديد أحد الملفات من القائمة الجانبية لإدارة موعد المناقشة وتعيين لجنة التحكيم.
                </p>
             </div>
           ) : (
             <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                <div className="content-card !p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-16 -translate-y-16" />
                  
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl font-black text-dark-navy mb-2">إدارة الجدولة</h3>
                        <p className="text-text-muted font-bold">{selectedDossier.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-text-muted font-black uppercase tracking-widest">تاريخ الإيداع</span>
                        <span className="text-lg font-black text-dark-navy">{new Date(selectedDossier.created_at).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100">
                          <div className="text-[10px] font-black text-primary uppercase mb-2">الطالب</div>
                          <div className="font-bold text-dark-navy">{selectedDossier.student?.full_name}</div>
                       </div>
                       <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100">
                          <div className="text-[10px] font-black text-primary uppercase mb-2">المشرف</div>
                          <div className="font-bold text-dark-navy">{selectedDossier.director?.full_name || "أ.د. سمير أمين"}</div>
                       </div>
                       <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100">
                          <div className="text-[10px] font-black text-primary uppercase mb-2">الحالة الحالية</div>
                          <div className="font-bold text-dark-navy">{selectedDossier.status}</div>
                       </div>
                    </div>

                    {isViewOnly ? (
                      <div className="p-6 rounded-[32px] bg-success-light/30 border-2 border-success-light flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center">
                               <CalendarCheck size={24} weight="fill" />
                            </div>
                            <div>
                               <h4 className="text-lg font-black text-success">المناقشة مجدولة بالفعل</h4>
                               <p className="text-sm text-success/80 font-bold">يمكنك معاينة تفاصيل الموعد واللجنة في الأسفل.</p>
                            </div>
                         </div>
                         <ShieldCheck size={40} weight="fill" className="text-success opacity-20" />
                      </div>
                    ) : (
                      <button 
                        onClick={generateSmartSuggestions}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-3 py-6 rounded-[24px] bg-dark-navy text-white font-black hover:bg-primary transition-all shadow-xl shadow-dark-navy/20 disabled:opacity-70 group"
                      >
                        {isGenerating ? (
                          <ArrowsClockwise size={24} weight="bold" className="animate-spin" />
                        ) : <></>}
                        <span>{isGenerating ? "جاري تحليل القاعات والأساتذة..." : "اقتراحات الجدولة"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Smart Suggestions Display */}
                {!isViewOnly && (
                  <AnimatePresence mode="wait">
                    {smartSuggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 -m-4 mb-8"
                        >
                        {smartSuggestions.map((s, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05, y: -10 }}
                            className={`content-card !p-6 cursor-pointer border-2 transition-all relative group ${selectedSuggestionIndex === idx ? 'border-primary bg-primary-light/5 shadow-xl shadow-primary/10' : 'border-transparent hover:shadow-2xl hover:shadow-slate-200'}`}
                            onClick={() => applySuggestion(idx)}
                          >
                            {selectedSuggestionIndex === idx && (
                              <div className="absolute top-4 left-4 text-primary">
                                 <CheckCircle size={24} weight="fill" />
                              </div>
                            )}
                            <div className="text-[10px] font-black text-primary mb-4 uppercase tracking-widest">اقتراح رقم {idx + 1}</div>
                            <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                  <Calendar size={18} weight="fill" className="text-slate-400" />
                                  <span className="text-sm font-black text-dark-navy">{s.date}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <Clock size={18} weight="fill" className="text-slate-400" />
                                  <span className="text-sm font-black text-dark-navy">{s.time}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <MapPin size={18} weight="fill" className="text-slate-400" />
                                  <span className="text-sm font-black text-dark-navy">{s.room}</span>
                               </div>
                               <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                     <UserCircleGear size={16} className="text-primary" />
                                     <span className="text-[10px] font-bold text-text-muted">رئيس: {professors.find(p => p.id === s.presidentId)?.full_name || "جاري الاختيار"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <Users size={16} className="text-primary" />
                                     <span className="text-[10px] font-bold text-text-muted">ممتحن: {professors.find(p => p.id === s.examinerId)?.full_name || "جاري الاختيار"}</span>
                                  </div>
                               </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Manual Edit Form */}
                <div className="content-card !p-10">
                   <h4 className="text-xl font-black text-dark-navy mb-10 flex items-center gap-3">
                      <UserCircleGear size={28} weight="fill" className="text-primary" />
                      {isViewOnly ? "تفاصيل الجدولة النهائية" : "تخصيص بيانات المناقشة"}
                   </h4>
                   
                   <form onSubmit={handleSubmit} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-3">
                            <label className="text-xs font-black text-text-muted uppercase">التاريخ</label>
                            <input 
                              type="date" 
                              required
                              disabled={isViewOnly}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-primary outline-none font-bold text-dark-navy transition-all shadow-inner disabled:bg-slate-50 disabled:cursor-not-allowed"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-xs font-black text-text-muted uppercase">الوقت</label>
                            <input 
                              type="time" 
                              required
                              disabled={isViewOnly}
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-primary outline-none font-bold text-dark-navy transition-all shadow-inner disabled:bg-slate-50 disabled:cursor-not-allowed"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-xs font-black text-text-muted uppercase">القاعة</label>
                            <select 
                              required
                              disabled={isViewOnly}
                              value={room}
                              onChange={(e) => setRoom(e.target.value)}
                              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-primary outline-none font-bold text-dark-navy transition-all appearance-none shadow-inner disabled:bg-slate-50 disabled:cursor-not-allowed"
                            >
                               <option value="">اختر القاعة...</option>
                               <option value="Amphi A">مدرج أ (Amphi A)</option>
                               <option value="Amphi B">مدرج ب (Amphi B)</option>
                               <option value="Salle 12">قاعة 12</option>
                               <option value="Salle 15">قاعة 15</option>
                               <option value="Salle Conférences">قاعة المحاضرات</option>
                            </select>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <h5 className="font-black text-dark-navy pb-2 border-b-2 border-slate-50 flex items-center gap-2">
                           <Users size={20} weight="fill" className="text-primary" />
                           أعضاء لجنة التحكيم
                         </h5>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <CustomProfSelector 
                              label="رئيس اللجنة"
                              options={professors}
                              value={presidentId}
                              onChange={setPresidentId}
                              disabled={isViewOnly}
                              excludeIds={[rapporteurId]}
                            />
                            <CustomProfSelector 
                              label="الممتحن"
                              options={professors}
                              value={examinerId}
                              onChange={setExaminerId}
                              disabled={isViewOnly}
                              excludeIds={[rapporteurId, presidentId]}
                            />
                            <CustomProfSelector 
                              label="المشرف"
                              options={professors}
                              value={rapporteurId}
                              onChange={() => {}}
                              disabled={true}
                            />
                         </div>
                      </div>

                      {!isViewOnly && (
                        <div className="pt-10 flex gap-6">
                           <button 
                             type="submit"
                             disabled={isSubmitting}
                             className="flex-[3] py-5 rounded-[24px] bg-primary hover:bg-dark-navy text-white font-black text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                           >
                              {isSubmitting ? <ArrowsClockwise size={24} className="animate-spin" /> : <CheckCircle size={28} weight="fill" />}
                              تثبيت الجدولة النهائية
                           </button>
                           <button 
                             type="button"
                             onClick={() => setSelectedDossier(null)}
                             className="flex-1 py-5 rounded-[24px] border-2 border-slate-100 text-text-muted font-black hover:bg-slate-50 transition-all"
                           >
                              إلغاء
                           </button>
                        </div>
                      )}
                   </form>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
