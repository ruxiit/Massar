"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <LoginForm
      portalName="بوابة القسم (N1)"
      requiredRole="departement"
      redirectPath="/admin"
      icon={ShieldAlert}
    />
  );
}
