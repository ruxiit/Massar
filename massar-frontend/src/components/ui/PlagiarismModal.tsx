"use client";

import { useState, useEffect } from "react";
import { 
  CloudArrowUp, 
  X, 
  ArrowsClockwise, 
  FilePdf, 
  WarningCircle, 
  CheckCircle,
  MagnifyingGlass,
  Database,
  FileMagnifyingGlass,
  ShieldCheck
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface PlagiarismModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
}

const steps = [
  { id: 1, text: "رفع الملف إلى خوادم iThenticate...", icon: <CloudArrowUp size={24} /> },
  { id: 2, text: "استخراج النصوص وتحليل البنية...", icon: <FileMagnifyingGlass size={24} /> },
  { id: 3, text: "مقارنة مع قواعد البيانات العالمية والمجلات العلمية...", icon: <Database size={24} /> },
  { id: 4, text: "فحص التشابه مع المحتوى المتاح على شبكة الإنترنت...", icon: <MagnifyingGlass size={24} /> },
  { id: 5, text: "توليد تقرير الاقتباس النهائي...", icon: <ShieldCheck size={24} /> },
];

export function PlagiarismModal({ isOpen, onClose, onComplete }: PlagiarismModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setIsSimulating(false);
      setCurrentStep(0);
      setProgress(0);
      setResult(null);
    }
  }, [isOpen]);

  const startSimulation = () => {
    if (!file) return;
    setIsSimulating(true);
    setCurrentStep(0);
    setProgress(0);

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        setProgress((stepIndex / steps.length) * 100);
      } else {
        clearInterval(interval);
        const finalScore = Math.floor(Math.random() * 35) + 5; // Random score between 5 and 40
        setResult(finalScore);
        setProgress(100);
        setIsSimulating(false);
        setTimeout(() => {
          onComplete(finalScore);
        }, 1500);
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-dark-navy/80 backdrop-blur-xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
              <ShieldCheck size={28} weight="fill" />
            </div>
            <div className="text-right">
              <h3 className="text-xl font-black text-dark-navy">فحص iThenticate</h3>
              <p className="text-sm text-text-muted font-bold">فحص للتأكد من نسبة الاقتباس قبل الإيداع الرسمي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={24} className="text-text-muted" />
          </button>
        </div>

        <div className="p-10">
          {!isSimulating && result === null ? (
            <div className="space-y-8">
              <div className="text-center">
                <label className="border-4 border-dashed border-slate-100 rounded-[40px] p-12 text-center hover:bg-primary-light/10 hover:border-primary transition-all cursor-pointer group bg-slate-50/50 block relative">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <div className="w-20 h-20 bg-white text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform">
                    <CloudArrowUp size={40} weight="fill" />
                  </div>
                  <h4 className="text-xl font-black text-dark-navy mb-2">
                    {file ? file.name : "اختر ملف المذكرة للفحص"}
                  </h4>
                  <p className="text-sm text-text-muted font-bold">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "يدعم PDF, DOCX (بحد أقصى 50MB)"}
                  </p>
                </label>
              </div>

              <button 
                onClick={startSimulation}
                disabled={!file}
                className="w-full py-5 bg-primary hover:bg-dark-navy text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <ArrowsClockwise size={22} weight="bold" />
                بدء عملية التحليل
              </button>
            </div>
          ) : isSimulating ? (
            <div className="space-y-10 py-4">
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 right-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-6">
                {steps.map((step, idx) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0.3, x: 20 }}
                    animate={{ 
                      opacity: idx === currentStep ? 1 : idx < currentStep ? 0.6 : 0.3,
                      x: idx === currentStep ? 0 : 0
                    }}
                    className={`flex items-center gap-4 text-right ${idx === currentStep ? 'text-primary' : 'text-dark-navy'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === currentStep ? 'bg-primary text-white shadow-lg shadow-primary/20' : idx < currentStep ? 'bg-success text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {idx < currentStep ? <CheckCircle size={20} weight="bold" /> : idx === currentStep ? <ArrowsClockwise size={20} className="animate-spin" /> : step.icon}
                    </div>
                    <span className={`text-base font-black ${idx === currentStep ? 'scale-105 transition-transform' : ''}`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-8 animate-in zoom-in-95 duration-500">
              <div className="relative inline-block">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={502.4}
                    initial={{ strokeDashoffset: 502.4 }}
                    animate={{ strokeDashoffset: 502.4 - (502.4 * (result || 0)) / 100 }}
                    className={result && result > 20 ? "text-red-500" : "text-emerald-500"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-black ${(result || 0) > 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {result}%
                  </span>
                  <span className="text-sm font-bold text-text-muted uppercase tracking-wider">نسبة الاقتباس</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl font-black text-dark-navy">اكتمل تحليل الملف</h4>
                <p className={`text-lg font-bold ${(result || 0) > 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(result || 0) > 20 
                    ? "تنبيه: نسبة الاقتباس تتجاوز الحد المسموح به (20%)" 
                    : "ممتاز! نسبة الاقتباس ضمن الحدود المسموح بها"}
                </p>
                <p className="text-sm text-text-muted font-medium max-w-sm mx-auto">
                  تمت مقارنة ملفك مع ملايين المصادر الأكاديمية والنتائج متاحة الآن للمراجعة.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="px-12 py-4 bg-dark-navy hover:bg-primary text-white font-black rounded-2xl transition-all shadow-xl"
              >
                العودة للوحة التحكم
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
