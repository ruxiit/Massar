"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps {
  userType?: 'student' | 'teacher' | 'admin';
}

export function Topbar({ userType = 'student' }: TopbarProps) {
  const today = new Date().toLocaleDateString('ar-DZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let userName = "طالب";
  let userRole = "ماستر 2 - ذكاء إصطناعي";
  let userInitial = "ط";

  if (userType === 'teacher') {
    userName = "أستاذ";
    userRole = "أستاذ محاضر - قسم الإلكترونيك";
    userInitial = "أ";
  } else if (userType === 'admin') {
    userName = "إدارة الجامعة";
    userRole = "كلية التكنولوجيا";
    userInitial = "إ";
  }

  return (
    <header className="h-20 flex items-center justify-between px-10 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-text-muted font-medium">
        <CalendarBlank size={20} />
        <span>{today}</span>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="user-profile flex items-center gap-4 bg-white p-2 pr-5 pl-2 rounded-full shadow-soft-sm">
          <div className="text-right">
            <div className="font-bold text-sm text-dark-navy">{userName}</div>
            <div className="text-xs text-text-muted">{userRole}</div>
          </div>
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
