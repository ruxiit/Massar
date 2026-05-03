
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { 
  SquaresFour, 
  CalendarCheck, 
  ShieldCheck, 
  Archive,
  GraduationCap
} from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminLinks = [
    { title: "لوحة التحكم", href: "/admin", icon: SquaresFour },
    { title: "مراجعة المشاريع البحثية", href: "/themes", icon: GraduationCap },
    { title: "جدولة المناقشات", href: "/schedule", icon: CalendarCheck },
    { title: "التوقيع الرقمي", href: "/sign", icon: ShieldCheck },
    { title: "الأرشيف الرقمي", href: "/archive", icon: Archive },
  ];

  return (
    <AuthGuard loginPath="/login/admin" requiredRole="departement">
      <div className="flex w-full h-screen bg-slate-50/50">
        <Sidebar links={adminLinks} portalName="الإدارة" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar userType="admin" />
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
