
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { 
  SquaresFour, 
  BookBookmark 
} from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const studentLinks = [
    { name: "لوحة التحكم", href: "/student", icon: SquaresFour },
    { name: "تفاصيل المذكرة", href: "/student/details", icon: BookBookmark },
  ];

  return (
    <AuthGuard loginPath="/login/student" requiredRole="etudiant">
      <div className="flex w-full h-screen bg-slate-50/50">
        <Sidebar links={studentLinks} portalName="بوابة الطالب" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar userType="student" />
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
