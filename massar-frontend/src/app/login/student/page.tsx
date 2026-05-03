"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { GraduationCap } from "lucide-react";

export default function StudentLoginPage() {
  return (
    <LoginForm
      portalName="بوابة الطالب (A1)"
      requiredRole="etudiant"
      redirectPath="/student"
      icon={GraduationCap}
    />
  );
}
