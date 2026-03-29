"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, 
  ChevronLeft, 
  Loader2, 
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  Video,
  Download
} from "lucide-react";
import api from "@/lib/api";

interface Prescription {
  sessionSummary: string;
  focus: string;
  dailyExercises: string[];
  weeklyPractice: string[];
  lifestyleGuidance: string[];
  followUp: string;
  status: 'draft' | 'final';
}

export default function PatientReport() {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [aptRes, presRes] = await Promise.all([
          api.get(`/api/appointments/${id}`),
          api.get(`/api/prescriptions/${id}`)
        ]);

        if (aptRes.data.statusCode === 200) setAppointment(aptRes.data.data);
        if (presRes.data.statusCode === 200) setPrescription(presRes.data.data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const isJoinable = () => {
    if (!appointment) return false;
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const diff = (now.getTime() - startTime.getTime()) / (1000 * 60);
    return diff >= -10 && diff <= 10;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-slate-400 font-bold animate-pulse">Retrieving your session report...</p>
    </div>
  );

  if (!prescription || prescription.status !== 'final') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-8 text-center">
         <div className="w-20 h-20 bg-amber-50 rounded-[32px] flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-amber-400" />
         </div>
         <h1 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Session in Progress</h1>
         <p className="text-slate-400 font-bold max-w-sm mb-8">Your clinical report will appear here once the professional finalizes the session.</p>
         
         <div className="flex flex-col gap-3 w-full max-w-xs">
           {appointment?.meetLink && (
             <button 
               disabled={!isJoinable()}
               onClick={() => isJoinable() && window.open(appointment.meetLink, '_blank')}
               className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                 isJoinable() 
                 ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105" 
                 : "bg-slate-100 text-slate-400 cursor-not-allowed"
               }`}
             >
               <Video className="w-4 h-4" /> {isJoinable() ? "Join Live Session" : "Join Restricted"}
             </button>
           )}
           {appointment?.receiptPath && (
             <button 
               onClick={() => window.open(appointment.receiptPath, '_blank')}
               className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
             >
               <Download className="w-4 h-4" /> Download Receipt
             </button>
           )}
           <button onClick={() => router.back()} className="mt-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600">Go Back</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center px-10 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-all mr-6">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Therapeutic Session Report</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Released by {appointment?.doctorName || "Professional"}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-16 px-6 space-y-12">
        {/* Session Meta */}
        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-wrap gap-12 items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
               <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Date</p>
              <p className="font-black text-slate-800 tracking-tight">{new Date(appointment?.startTime).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
               <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</p>
              <p className="font-black text-slate-800 tracking-tight">{new Date(appointment?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Section: Session Summary */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-800 px-2">
             <FileText className="w-4 h-4 text-primary" />
             <h3 className="text-xs font-black uppercase tracking-widest">Session Summary</h3>
           </div>
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm leading-loose text-slate-600 font-medium">
             <p className="mb-4 text-xs font-black text-primary uppercase tracking-widest">Therapeutic Focus: {prescription.focus}</p>
             {prescription.sessionSummary.split("\n").map((line, i) => (
                <p key={i} className={line ? "mb-4" : "h-4"} >{line}</p>
             ))}
           </div>
        </section>

        {/* Section: Daily Exercises */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 text-slate-800 px-2">
             <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
             <h3 className="text-xs font-black uppercase tracking-widest">Daily Clinical Exercises</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
             {prescription.dailyExercises.map((ex, i) => (
                <div key={i} className="group bg-white p-8 rounded-[32px] border border-slate-100 hover:border-primary/20 transition-all flex gap-6 items-start shadow-sm">
                   <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all">
                     {i + 1}
                   </div>
                   <p className="flex-1 font-bold text-slate-700 leading-relaxed">{ex}</p>
                </div>
             ))}
           </div>
        </section>

        {/* Section: Weekly Practice & Lifestyle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="space-y-6">
             <div className="flex items-center gap-2 text-slate-800 px-2">
               <Calendar className="w-4 h-4 text-primary" />
               <h3 className="text-xs font-black uppercase tracking-widest">Weekly Practice</h3>
             </div>
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 space-y-4 shadow-sm">
               {prescription.weeklyPractice.map((p, i) => (
                 <div key={i} className="flex gap-4 items-center font-bold text-slate-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                    {p}
                 </div>
               ))}
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-2 text-slate-800 px-2">
               <CheckCircle2 className="w-4 h-4 text-green-500" />
               <h3 className="text-xs font-black uppercase tracking-widest">Lifestyle Guidance</h3>
             </div>
             <div className="bg-slate-900 p-8 rounded-[40px] space-y-4 shadow-xl">
               {prescription.lifestyleGuidance.map((g, i) => (
                 <div key={i} className="flex gap-4 items-center font-bold text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    {g}
                 </div>
               ))}
             </div>
          </section>
        </div>

        {/* Next Session */}
        {prescription.followUp && (
          <div className="bg-white p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                   <Calendar className="w-6 h-6" />
                </div>
                <p className="font-black text-slate-800 tracking-tight">Your next recommended session: <span className="text-primary">{prescription.followUp}</span></p>
             </div>
             <button className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest">
                Book Follow-up
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
