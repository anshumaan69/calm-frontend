"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  TrendingUp,
  FileSearch,
  Plus,
  Loader2,
  Filter
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lastVisit: string;
  condition: string;
  appointmentsCount: number;
  lastAppointmentId: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/appointments/doctor/me');
        if (res.data.statusCode === 200) {
          const apts = res.data.data;
          
          // Derive unique patients from appointments
          const patientMap = new Map<string, Patient>();
          
          apts.forEach((apt: any) => {
            const userId = apt.userId;
            if (!patientMap.has(userId)) {
              patientMap.set(userId, {
                id: userId,
                name: apt.patientName || "Anonymous Patient",
                lastVisit: apt.startTime,
                condition: apt.problem || "General Consultation",
                appointmentsCount: 1,
                lastAppointmentId: apt._id
              });
            } else {
              const p = patientMap.get(userId)!;
              p.appointmentsCount += 1;
              if (new Date(apt.startTime) > new Date(p.lastVisit)) {
                p.lastVisit = apt.startTime;
                p.lastAppointmentId = apt._id;
              }
            }
          });
          
          setPatients(Array.from(patientMap.values()));
        }
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading patient directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Clinical Directory</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Managed records and session history per patient</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all shadow-sm w-[300px] placeholder:text-slate-300"
            />
          </div>
          <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>
      </header>

      {/* Patients List */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] group-hover:scale-110 transition-transform"></div>
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border-4 border-white shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    {patient.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl border-4 border-white bg-green-500 shadow-sm"></div>
                </div>
                <button className="p-2 text-slate-200 hover:text-slate-800 transition-colors bg-slate-50 rounded-xl">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8 relative z-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{patient.name}</h3>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">UID: {patient.id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/50 group-hover:bg-white transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Session</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/50 group-hover:bg-white transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Visits</p>
                  <p className="text-xs font-bold text-slate-700">{patient.appointmentsCount} Sessions</p>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {patient.condition}
                </div>
                <Link 
                  href={`/doctor/sessions/${patient.lastAppointmentId}`}
                  className="flex items-center gap-2 text-[10px] font-black text-primary hover:gap-3 transition-all uppercase tracking-widest"
                >
                  Medical Records 
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[48px] border-2 border-dashed border-slate-100">
           <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-slate-200" />
           </div>
           <p className="text-xl font-black text-slate-800">No Patients Found</p>
           <p className="text-slate-400 font-bold mt-1">Try adjusting your search criteria</p>
           <button 
             onClick={() => setSearchQuery("")}
             className="mt-8 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
           >
             Clear Search
           </button>
        </div>
      )}
    </div>
  );
}
