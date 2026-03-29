"use client";

import { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  MoreVertical,
  Video,
  FileText,
  User,
  Clock,
  Loader2,
  CalendarDays
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState("ALL"); // ALL, CONFIRMED, PENDING, COMPLETED

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/api/appointments/doctor/me');
        if (res.data.statusCode === 200) {
          setAppointments(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Generate calendar days (current week)
  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        fullDate: d.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const isJoinable = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = (now.getTime() - start.getTime()) / (1000 * 60);
    return diff >= -10 && diff <= 10;
  };

  const filteredAppointments = appointments.filter(apt => {
    const isSameDate = apt.startTime.startsWith(selectedDate);
    const matchesFilter = filter === "ALL" || apt.status.toUpperCase() === filter;
    return isSameDate && matchesFilter;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Your Schedule</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage and review your upcoming therapy sessions</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            {["ALL", "CONFIRMED", "PENDING"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                  filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            New Appointment
          </button>
        </div>
      </header>

      {/* Calendar Strip */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {getCalendarDays().map((day, i) => {
            const isSelected = selectedDate === day.fullDate;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(day.fullDate)}
                className={`flex flex-col items-center min-w-[80px] p-5 rounded-2xl transition-all cursor-pointer group hover:scale-105 ${
                  isSelected ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-800 border border-transparent'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isSelected ? 'text-white/80' : 'text-slate-400 group-hover:text-primary'}`}>
                  {day.name}
                </span>
                <span className="text-xl font-black">{day.date}</span>
                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 animate-pulse"></div>}
              </div>
            );
          })}
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <CalendarDays className="w-4 h-4" />
               {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full">
              {filteredAppointments.length} Sessions
            </span>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAppointments.map((apt) => (
                <div key={apt._id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-all duration-500 opacity-10 ${
                    apt.status === 'CONFIRMED' ? 'bg-green-500' : apt.status === 'PENDING' ? 'bg-amber-500' : 'bg-primary'
                  }`}></div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary border-2 border-white shadow-lg group-hover:bg-primary group-hover:text-white transition-all">
                          {apt.patientName?.[0] || apt.userId?.[0] || 'P'}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{apt.patientName || "Anonymous Patient"}</h3>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 border border-slate-100 mt-2 uppercase tracking-tight">
                             <Clock className="w-3.5 h-3.5" />
                             {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-slate-800 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                             <User className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Symptom / Issue</span>
                             <span className="text-xs font-bold text-slate-700">{apt.problem || "General Therapy"}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        apt.status === 'CONFIRMED' ? 'bg-green-500 px-1' : 
                        apt.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                      }`}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{apt.status}</span>
                    </div>
                    <div className="flex gap-2">
                       <Link 
                        href={`/doctor/sessions/${apt._id}`}
                        className="px-4 py-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center"
                      >
                        View Detail
                      </Link>
                       <button 
                         disabled={!apt.meetLink || !isJoinable(apt.startTime)}
                         onClick={() => isJoinable(apt.startTime) && apt.meetLink && window.open(apt.meetLink, '_blank')}
                         className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 ${
                           apt.meetLink && isJoinable(apt.startTime)
                           ? "bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95" 
                           : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                         }`}
                       >
                          <Video className="w-4 h-4" />
                          {apt.meetLink && isJoinable(apt.startTime) ? "Join Session" : !isJoinable(apt.startTime) && apt.meetLink ? "Time Restricted" : "Wait for Link"}
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 border-dashed border-2">
               <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                  <CalendarDays className="w-10 h-10 text-slate-200" />
               </div>
               <p className="text-xl font-black text-slate-800 mb-2">No Appointments Found</p>
               <p className="text-slate-400 font-bold">You don&apos;t have any sessions scheduled for this day.</p>
               <button 
                 onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                 className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline"
               >
                 Back to Today
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
