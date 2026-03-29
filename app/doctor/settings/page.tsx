"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  ChevronRight,
  Camera,
  Loader2,
  Mail,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/user/me');
        if (res.data.statusCode === 200) {
          setProfile(res.data.data.user || res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const sections = [
    { title: "Profile Information", icon: User, items: ["Public Profile", "Credentials", "Bio & Experience"] },
    { title: "Notifications", icon: Bell, items: ["Email Alerts", "In-app Messages", "SMS Reminders"] },
    { title: "Privacy & Security", icon: Shield, items: ["Change Password", "Two-Factor Auth", "Data Permissions"] },
    { title: "Session Settings", icon: Smartphone, items: ["Video Quality", "Default Durations", "Integration Link"] },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Portal Settings</h1>
        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Customize your dashboard experience and profile</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/5 to-transparent"></div>
            
            <div className="relative inline-block mb-8 group cursor-pointer z-10">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative transition-transform duration-500 group-hover:scale-105 bg-primary/10 flex items-center justify-center text-primary font-black text-4xl">
                {profile?.name?.[0] || "D"}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl border-2 border-white group-hover:rotate-12 transition-all">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{profile?.name || "Dr. Practitioner"}</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 py-1 px-4 rounded-full inline-block">
                {profile?.role || "Healthcare Provider"}
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-12 relative z-10">
               <div className="text-center group/item cursor-pointer">
                  <p className="text-lg font-black text-slate-800 group-hover/item:text-primary transition-colors">--</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rating</p>
               </div>
               <div className="w-[1px] h-8 bg-slate-50"></div>
               <div className="text-center group/item cursor-pointer">
                  <p className="text-lg font-black text-slate-800 group-hover/item:text-primary transition-colors">--</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Exp</p>
               </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
               <Mail className="w-4 h-4 text-slate-400" />
               <span className="text-xs font-bold text-slate-500 lowercase">{profile?.email || "doctor@calmscious.com"}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer group flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center mb-8 shadow-sm">
                <section.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-6 tracking-tight">{section.title}</h4>
              <ul className="space-y-5 flex-1">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-center justify-between text-sm font-bold text-slate-400 hover:text-slate-800 transition-all group/item">
                    <span className="group-hover/item:translate-x-1 transition-transform">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-200 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                  Manage Settings <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
