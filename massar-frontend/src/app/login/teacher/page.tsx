"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Users } from "lucide-react";

export default function TeacherLoginPage() {
  return (
    <LoginForm
      portalName="بوابة الأستاذ (A2)"
      requiredRole="directeur"
      redirectPath="/teacher"
      icon={Users}
    />
  );
}
