"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("accessToken");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");

    if (token) {
      localStorage.setItem("accessToken", token);
      if (userId) localStorage.setItem("userId", userId);
      if (name) localStorage.setItem("userName", name);
      if (role) localStorage.setItem("userRole", role);

      // Redirect based on role
      if (role === "DOCTOR") {
        window.location.href = "/doctor";
      } else if (role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } else {
      // If no token, redirect to login with error
      window.location.href = "/login?error=Authentication failed";
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="p-12 bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col items-center gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Authenticating...</h1>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Restoring your session</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <Loader2 className="w-8 h-8 text-primary animate-spin" />
       </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
