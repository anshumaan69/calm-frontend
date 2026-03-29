"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Globe, 
  User, 
  Lock, 
  ArrowRight, 
  Shield, 
  Activity,
  Loader2,
  AlertCircle 
} from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const [role, setRole] = useState<"PATIENT" | "DOCTOR" | "ADMIN">("PATIENT");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    // Redirect to backend Google auth endpoint as per calmscious.txt
    window.location.href = `${api.defaults.baseURL}/api/auth/google`;
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/auth/login", { identifier: userId, password });
      if (res.data.statusCode === 200) {
        const { accessToken, refreshToken, user } = res.data.data;
        const userRole = user.role;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userId", user.userId);
        
        // Redirect based on role
        if (userRole === "DOCTOR") window.location.href = "/doctor";
        else if (userRole === "ADMIN") window.location.href = "/admin";
        else window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please check your Identifier and Password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-primary/20">
      <div className="max-w-4xl w-full bg-white rounded-[48px] shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side - Visual/Info */}
        <div className="md:w-1/2 bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-block mb-12">
              <Image src="/logo.png" alt="Calmscious" width={140} height={40} className="brightness-0 invert" />
            </Link>
            <h1 className="text-4xl font-black tracking-tighter leading-tight mb-6">
              Welcome back to <br />
              your sanctuary.
            </h1>
            <p className="text-white/80 font-bold leading-relaxed">
              Log in to access your personalized wellness journey, track your progress, or manage your professional sessions.
            </p>
          </div>

          <div className="relative z-10 mt-12 p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Secure Access</p>
            </div>
            <p className="text-xs font-bold text-white/70">
              Your data is encrypted and protected with industry-standard security protocols.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sign In</h2>
            <p className="text-slate-400 font-bold">Select your profile type to continue</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setRole("PATIENT"); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'PATIENT' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Patient
            </button>
            <button 
              onClick={() => { setRole("DOCTOR"); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'DOCTOR' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Doctor
            </button>
            <button 
              onClick={() => { setRole("ADMIN"); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'ADMIN' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          {role === "PATIENT" ? (
            <div className="space-y-6">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-primary/20 transition-all font-black text-slate-700 shadow-sm"
              >
                <Globe className="w-5 h-5 text-primary" />
                Sign in with Google
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-300">
                  <span className="bg-white px-4">Standard Flow</span>
                </div>
              </div>
              <p className="text-center text-xs font-bold text-slate-400 px-4 leading-relaxed">
                By signing in, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCredentialsLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {role === "DOCTOR" ? "Doctor Identifier (e.g. DOC_001)" : "Admin Identifier"}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    required
                    placeholder={role === "DOCTOR" ? "Enter DOC ID..." : "Enter Admin ID..."}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary" />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
              </div>
            </form>
          )}

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
               {role === "DOCTOR" ? <Activity className="w-3.5 h-3.5 text-primary" /> : <Shield className="w-3.5 h-3.5 text-secondary" />}
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {role} Portal v1.0
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
        Mindful consciousness &copy; 2026 Calmscious
      </div>
    </div>
  );
}
