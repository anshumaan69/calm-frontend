"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  Loader2,
  Clock
} from "lucide-react";
import api from "@/lib/api";

interface DoctorUser {
  _id: string;
  name: string;
  role: string;
  email: string;
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<DoctorUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token && pathname !== '/login') {
      window.location.href = '/login';
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/user/me');
        if (res.data.statusCode === 200) {
          setUser(res.data.data.user || res.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/doctor" },
    { label: "Appointments", icon: Calendar, href: "/doctor/appointments" },
    { label: "Patients", icon: Users, href: "/doctor/patients" },
    { label: "Schedule", icon: Clock, href: "/doctor/schedule" },
    { label: "Settings", icon: Settings, href: "/doctor/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-50 transition-all duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="relative w-10 h-10 group">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all"></div>
            <Image src="/logo-brain.png" alt="Calmscious" fill className="object-contain relative z-10" sizes="40px" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">Doctor</span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                <span className="tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 mb-6 group cursor-pointer hover:border-primary/30 transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Session Status</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[11px] font-bold text-slate-800">Connection: Active</p>
            </div>
            <p className="text-[10px] font-medium text-slate-400">Ready for upcoming calls</p>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/';
            }}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group ring-1 ring-transparent hover:ring-red-100"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-tight">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-40 transition-all duration-300">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {navItems.find(item => item.href === pathname)?.label || "Doctor Dashboard"}
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Live • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="hidden lg:flex relative max-w-md flex-1 ml-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search sessions or records..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="relative p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-primary transition-all duration-300 group">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
              <button className="relative p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-primary transition-all duration-300">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-200"></span>
              </button>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>
            
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                {loading ? (
                   <div className="h-10 flex flex-col justify-center">
                     <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-1"></div>
                     <div className="h-2 w-16 bg-slate-50 rounded animate-pulse"></div>
                   </div>
                ) : (
                  <>
                    <p className="text-sm font-black text-slate-800 leading-none">{user?.name || "Dr. Practitioner"}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{user?.role || "Healthcare Provider"}</p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[2px] shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer">
                <div className="w-full h-full rounded-[14px] bg-white overflow-hidden relative border-2 border-white flex items-center justify-center">
                  {!loading && user?.name ? (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                      {user.name[0]}
                    </div>
                  ) : (
                    <Loader2 className="w-5 h-5 text-slate-200 animate-spin" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-12 flex-1 relative">
           {/* Background Decor */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
           
           <div className="relative z-10">
            {children}
           </div>
        </div>
      </main>
    </div>
  );
}
