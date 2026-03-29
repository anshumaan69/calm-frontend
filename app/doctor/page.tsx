"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  Star,
  Plus, 
  ArrowRight,
  Loader2,
  Video,
  FileText
} from "lucide-react";
import api from "@/lib/api";

interface Appointment {
  _id: string;
  userId: string;
  patientName?: string;
  startTime: string;
  endTime: string;
  status: string;
  problem?: string;
  meetLink?: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaySessions: 0,
    totalHours: 0,
    avgRating: 5.0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/appointments/doctor/me');
        if (res.data.statusCode === 200) {
          const apts: Appointment[] = res.data.data;
          setAppointments(apts);

          // Calculate stats
          const uniquePatients = new Set(apts.map(a => a.userId)).size;
          const today = new Date().toISOString().split('T')[0];
          const todayApts = apts.filter(a => a.startTime.startsWith(today));
          
          // Total hours (approximate from confirmed sessions)
          const confirmedApts = apts.filter(a => a.status === 'CONFIRMED');
          const totalMins = confirmedApts.length * 30; // Assuming 30m slots
          
          setStats({
            totalPatients: uniquePatients,
            todaySessions: todayApts.length,
            totalHours: Math.round(totalMins / 60) || 0,
            avgRating: 5.0
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Patients", value: stats.totalPatients.toString(), icon: Users, color: "bg-blue-500", trend: "Live" },
    { label: "Today's Sessions", value: stats.todaySessions.toString(), icon: CalendarIcon, color: "bg-primary", trend: "Live" },
    { label: "Hours logged", value: stats.totalHours.toString(), icon: Clock, color: "bg-purple-500", trend: "Live" },
    { label: "Avg. Rating", value: stats.avgRating.toFixed(1), icon: Star, color: "bg-orange-500", trend: "Top Tier" },
  ];

  const isJoinable = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = (now.getTime() - start.getTime()) / (1000 * 60);
    return diff >= -10 && diff <= 10;
  };

  const getRecentActivity = () => {
    const recent = appointments
      .filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
      .slice(0, 3)
      .map(a => ({
        title: a.status === 'CONFIRMED' ? "New Booking" : "Session End",
        time: new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        desc: `${a.patientName || 'Patient'} - ${a.problem || 'General'}`,
        type: a.status === 'CONFIRMED' ? 'info' : 'success'
      }));

    if (recent.length === 0) {
      return [
        { title: "System Online", time: "Live", desc: "No recent activity recorded", type: "info" }
      ];
    }
    return recent;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Synchronizing clinical data...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments
    .filter(a => a.startTime.startsWith(todayStr))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Doctor Hub</h2>
          <p className="text-slate-400 font-bold tracking-tight uppercase tracking-widest text-[10px]">Managed clinical environment • {stats.todaySessions} Sessions Today</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/doctor/appointments" className="px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest text-[10px]">
             Full Schedule
          </Link>
          <Link href="/doctor/schedule" className="px-6 py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 uppercase tracking-widest">
            <Plus className="w-4 h-4" /> Manage Slots
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <div key={i} className="group bg-white p-8 rounded-[40px] border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-10 rounded-bl-[80px] group-hover:scale-110 transition-transform`}></div>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} text-white group-hover:scale-110 transition-transform shadow-lg shadow-current/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 uppercase tracking-widest`}>
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Appointments Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
               Today&apos;s Active Sessions
            </h3>
            <Link href="/doctor/appointments" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Focus</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((apt) => (
                      <tr key={apt._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                              {apt.patientName?.[0] || "P"}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 leading-none mb-1">{apt.patientName || "Anonymous Patient"}</p>
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">REF: {apt.userId.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 border border-slate-100">
                             <Clock className="w-3 h-3" />
                             {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-primary/5 text-[10px] font-black text-primary rounded-full uppercase tracking-widest border border-primary/10">
                            {apt.problem || "General"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right flex items-center justify-end gap-3">
                          <Link 
                            href={`/doctor/sessions/${apt._id}`}
                            className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                          >
                             <FileText className="w-4.5 h-4.5" />
                          </Link>
                          <button 
                            disabled={apt.status !== 'CONFIRMED' || !apt.meetLink || !isJoinable(apt.startTime)}
                            onClick={() => isJoinable(apt.startTime) && apt.meetLink && window.open(apt.meetLink, '_blank')}
                            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
                              apt.status === 'CONFIRMED' && apt.meetLink && isJoinable(apt.startTime)
                              ? "bg-primary text-white shadow-primary/20 hover:scale-105" 
                              : "bg-slate-50 text-slate-300 cursor-not-allowed shadow-none"
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            {apt.status === 'CONFIRMED' && apt.meetLink && isJoinable(apt.startTime) ? "Launch" : "Restricted"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mb-2">
                             <CalendarIcon className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className="text-xl font-black text-slate-300 tracking-tighter">No Active Sessions</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All caught up for today</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-12">
          {/* Quick Actions */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 px-2">Clinical Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href={appointments[0] ? `/doctor/sessions/${appointments[0]._id}` : "/doctor/sessions"}
                className={`p-6 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] border shadow-sm bg-slate-900 text-white hover:shadow-xl hover:shadow-slate-900/10 group`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 group-hover:bg-primary transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Add Notes</span>
              </Link>
              <Link 
                href="/doctor/patients"
                className={`p-6 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] border shadow-sm bg-white text-slate-800 border-slate-100 hover:border-primary/20 group`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Patients</span>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 px-2">Recent Activities</h3>
            <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16"></div>
              <div className="space-y-8 relative z-10">
                {getRecentActivity().map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-3 h-3 rounded-full z-10 ring-4 ring-white ${item.type === 'success' ? 'bg-green-500' : 'bg-primary'}`}></div>
                       {i < getRecentActivity().length - 1 && <div className="w-[1.5px] h-full bg-slate-50 group-hover:bg-slate-100 transition-colors"></div>}
                    </div>
                    <div className="space-y-1.5 -mt-1 pb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none">{item.title}</p>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-auto">{item.time}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                System History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
