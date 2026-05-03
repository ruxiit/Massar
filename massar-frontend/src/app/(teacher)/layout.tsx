
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { 
  ClipboardText, 
  CalendarCheck,
  GraduationCap
} from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const teacherLinks = [
    { title: "مراجعة المذكرات", href: "/teacher", icon: ClipboardText },
    { title: "المشاريع البحثية والإشراف", href: "/teacher/themes", icon: GraduationCap },
    { title: "المناقشات المبرمجة", href: "/teacher/discussions", icon: CalendarCheck },
  ];

  return (
    <AuthGuard loginPath="/login/teacher" requiredRole="directeur">
      <div className="flex w-full h-screen bg-slate-50/50">
        <Sidebar links={teacherLinks} portalName="بوابة الأستاذ" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar userType="teacher" />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
