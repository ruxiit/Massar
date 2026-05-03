"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface LoginFormProps {
  portalName: string;
  requiredRole: string;
  redirectPath: string;
  icon: React.ElementType;
}

export function LoginForm({
  portalName,
  requiredRole,
  redirectPath,
  icon: Icon,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Verify the role matches the portal requirements
      if (user.role !== requiredRole) {
        setError("غير مصرح لك بالدخول لهذه البوابة.");
        setIsLoading(false);
        return;
      }

      // Store the token and user info separately for each role to avoid session mixing
      localStorage.setItem(`token_${user.role}`, token);
      localStorage.setItem(`user_${user.role}`, JSON.stringify(user));
      
      // Also keep a generic 'token' for shared services if needed (optional)
      localStorage.setItem("token", token);
      
      // Redirect
      router.push(redirectPath);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.response?.status === 401) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.");
      }
    } finally {
      if (error === null) {
        setIsLoading(false); // Only stop loading if we got an error, else we are redirecting
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner text-blue-600">
            <Icon size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-slate-500 text-sm text-center">
            {portalName} - جامعة باجي مختار عنابة
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              البريد الإلكتروني الجامعي
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 transition-colors"
                placeholder="email@univ-annaba.dz"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white/50 transition-colors"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-slate-600">
                تذكرني
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>دخول</span>
                <ArrowRight size={18} className="mr-2 rotate-180" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
