"use client";

import clsx from "clsx";
import { Check, GraduationCap } from "@phosphor-icons/react";

const STEPS = [
  "اختيار المشروع",
  "إيداع الملف",
  "المراجعة",
  "اللجنة",
  "الجدولة",
  "المناقشة",
  "المحضر",
  "الأرشفة",
];

interface WorkflowStepperProps {
  currentStep: number; // 0 = supervision pending, 1-9 = dossier steps
}

export function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  // Step 0 means "not yet started the dossier — waiting for supervision"
  const displayStep = currentStep === 0 ? 0 : currentStep;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative px-2">
        {/* Background line */}
        <div className="absolute top-5 left-10 right-10 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full z-0" />

        {/* Active line */}
        <div className="absolute top-5 left-10 right-10 h-1.5 -translate-y-1/2 z-0">
          <div
            className="absolute top-0 right-0 h-full bg-primary rounded-full transition-all duration-700 ease-in-out shadow-sm"
            style={{
              width: `${Math.min(100, Math.max(0, (displayStep / (STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {STEPS.map((step, index) => {
          const isCompleted = index < displayStep;
          const isActive = index === displayStep;
          const isPending = index > displayStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3">
              <div
                className={clsx(
                  "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold border-4 transition-all duration-500 shadow-sm",
                  isCompleted
                    ? "bg-success border-success-light text-white"
                    : isActive
                    ? "bg-primary border-primary-light text-white shadow-md scale-110"
                    : "bg-white border-slate-50 text-text-muted"
                )}
              >
                {isCompleted ? (
                  <Check size={20} weight="bold" />
                ) : index === 0 ? (
                  <GraduationCap size={20} weight="fill" />
                ) : (
                  index
                )}
              </div>
              <span
                className={clsx(
                  "text-[11px] font-bold px-2 py-1 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "text-primary bg-primary-light rounded-full"
                    : isCompleted
                    ? "text-success"
                    : "text-text-muted"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

