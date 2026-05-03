"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({
  children,
  loginPath,
  requiredRole,
}: {
  children: React.ReactNode;
  loginPath: string;
  requiredRole?: string;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // If we have a required role, look for the specific token for that role
    // Otherwise fall back to the generic token
    const tokenKey = requiredRole ? `token_${requiredRole}` : "token";
    const userKey = requiredRole ? `user_${requiredRole}` : "user";

    const token = localStorage.getItem(tokenKey);
    const userRaw = localStorage.getItem(userKey);

    if (!token || !userRaw) {
      router.replace(loginPath);
      return;
    }

    // If a specific role is required, validate it
    if (requiredRole) {
      try {
        const user = JSON.parse(userRaw);
        if (user.role !== requiredRole) {
          // Wrong portal for this role — send back to login
          router.replace(loginPath);
          return;
        }
      } catch {
        router.replace(loginPath);
        return;
      }
    }

    setIsAuthenticated(true);
  }, [router, loginPath, requiredRole]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}
