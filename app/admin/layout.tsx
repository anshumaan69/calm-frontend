"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  Users, 
  LogOut,
  Bell
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Payments", icon: CreditCard, href: "/admin/payments" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
    { label: "Doctors", icon: Users, href: "/admin/doctors" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/logo-brain.png" alt="Calmscious" fill className="object-contain" sizes="40px" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">Admin</span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                  isActive 
                  ? "bg-[#22d3ee] text-white shadow-lg shadow-cyan-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group">
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {navItems.find(item => item.href === pathname)?.label || "Dashboard"}
            </h1>
            <p className="text-sm font-medium text-slate-400">Welcome back, Administrator</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800">System Admin</p>
                <p className="text-xs font-bold text-[#22d3ee]">Superuser</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                <Image src="/avatar-1.jpg" alt="Admin" fill className="object-cover" sizes="40px" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
