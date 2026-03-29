"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MessageSquare, 
  FileText, 
  Video, 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  Loader2, 
  User,
  Clock,
  Sparkles,
  RefreshCw,
  Download,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";

interface TranscriptMessage {
  speaker: string;
  text: string;
  timestamp: string;
}

interface Prescription {
  sessionSummary: string;
  focus: string;
  dailyExercises: string[];
  weeklyPractice: string[];
  lifestyleGuidance: string[];
  followUp: string;
  status: 'draft' | 'final';
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [prescription, setPrescription] = useState<Prescription>({
    sessionSummary: "",
    focus: "",
    dailyExercises: [],
    weeklyPractice: [],
    lifestyleGuidance: [],
    followUp: "",
    status: "draft"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [aptRes, transRes, presRes] = await Promise.all([
          api.get(`/api/appointments/${id}`),
          api.get(`/api/transcriptions/${id}`).catch(() => ({ data: { data: { messages: [] } } })),
          api.get(`/api/prescriptions/${id}`).catch(() => ({ data: { data: null } }))
        ]);

        if (aptRes.data.statusCode === 200) setAppointment(aptRes.data.data);
        if (transRes.data.statusCode === 200) setTranscript(transRes.data.data.messages || []);
        if (presRes.data.data) setPrescription(presRes.data.data);
      } catch (err) {
        console.error("Failed to fetch appointment details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();

    // Polling for live transcript
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/transcriptions/${id}`);
        if (res.data.statusCode === 200) setTranscript(res.data.data.messages || []);
      } catch (e) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleSavePrescription = async (isFinal = false) => {
    setSaving(true);
    try {
      if (isFinal) {
        const res = await api.post(`/api/prescriptions/${id}/finalize`);
        if (res.data.statusCode === 200) {
          // The response might be just { message: "..." } or the updated doc
          // If it's just a message, we should probably fetch the latest prescription
          const updatedPresRes = await api.get(`/api/prescriptions/${id}`);
          if (updatedPresRes.data.data) setPrescription(updatedPresRes.data.data);
          alert("Prescription finalized and released to patient!");
        }
      } else {
        const res = await api.patch(`/api/prescriptions/${id}`, prescription);
        if (res.data.statusCode === 200) {
          setPrescription(res.data.data);
        }
      }
    } catch (err) {
      alert("Failed to save prescription.");
    } finally {
      setSaving(false);
    }
  };

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
      <p className="text-slate-400 font-bold animate-pulse">Analyzing session data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Session with {appointment?.patientName || "Patient"}
            </h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {appointment?.status} • {new Date(appointment?.startTime).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {appointment?.receiptPath && (
            <button 
              onClick={() => window.open(appointment.receiptPath, '_blank')}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Receipt
            </button>
          )}
          {appointment?.meetLink && (
            <button 
              disabled={!isJoinable()}
              onClick={() => isJoinable() && window.open(appointment.meetLink, '_blank')}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                isJoinable() 
                ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Video className="w-4 h-4" /> {isJoinable() ? "Join Session" : "Join Restricted"}
            </button>
          )}
          <button 
            disabled={saving}
            onClick={() => handleSavePrescription(true)}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Finalize & Release
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-80px)]">
        {/* Left Col: Live Transcript */}
        <div className="border-r border-slate-100 flex flex-col bg-white">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              AI Transcription Feed
            </h3>
            <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          
          <div className="px-8 pt-6">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Bot Connection Required</h4>
                <p className="text-[11px] text-amber-700 font-medium mt-1">Please ensure you admit the <strong>Calmscious Assistant</strong> bot into your video call to begin live transcription.</p>
              </div>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8">
            {transcript.length > 0 ? (
              transcript.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.speaker === 'THERAPIST' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.speaker}</span>
                    <span className="text-[10px] font-bold text-slate-300">{m.timestamp}</span>
                  </div>
                  <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                    m.speaker === 'THERAPIST' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                    : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <RefreshCw className="w-12 h-12 text-slate-300 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waiting for session audio...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: AI Prescription Editor */}
        <div className="flex flex-col bg-[#f8fafc] overflow-y-auto">
          <div className="p-8 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
              AI-Generated Clinical Blueprint
            </h3>
            <button 
              onClick={() => handleSavePrescription(false)}
              className="text-[10px] font-black text-primary uppercase hover:underline"
            >
              Save Draft
            </button>
          </div>

          <div className="p-10 space-y-10">
            {/* Section: Session Summary */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 text-slate-800">
                 <FileText className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Session Summary</h4>
               </div>
               <textarea 
                 rows={4}
                 value={prescription.sessionSummary}
                 onChange={(e) => setPrescription({...prescription, sessionSummary: e.target.value})}
                 className="w-full p-6 bg-slate-50 rounded-[24px] text-sm font-medium border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                 placeholder="AI summary will appear here..."
               />
            </div>

            {/* Section: Focus */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 text-slate-800">
                 <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Therapeutic Focus</h4>
               </div>
               <input 
                 value={prescription.focus}
                 onChange={(e) => setPrescription({...prescription, focus: e.target.value})}
                 className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20"
                 placeholder="e.g. Nighttime anxiety management"
               />
            </div>

            {/* Section: Daily Exercises */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 text-slate-800">
                 <Clock className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Daily Exercises</h4>
               </div>
               <textarea 
                 rows={4}
                 value={prescription.dailyExercises.join("\n")}
                 onChange={(e) => setPrescription({...prescription, dailyExercises: e.target.value.split("\n").filter(x => x.trim())})}
                 className="w-full p-6 bg-slate-50 rounded-[28px] text-sm font-medium border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                 placeholder="One exercise per line..."
               />
            </div>

            {/* Section: Weekly Practice */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 text-slate-800">
                 <RefreshCw className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Weekly Practice</h4>
               </div>
               <textarea 
                 rows={4}
                 value={prescription.weeklyPractice.join("\n")}
                 onChange={(e) => setPrescription({...prescription, weeklyPractice: e.target.value.split("\n").filter(x => x.trim())})}
                 className="w-full p-6 bg-slate-50 rounded-[28px] text-sm font-medium border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                 placeholder="One practice per line..."
               />
            </div>

            {/* Section: Lifestyle Guidance */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 text-slate-800">
                 <User className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Lifestyle Guidance</h4>
               </div>
               <textarea 
                 rows={4}
                 value={prescription.lifestyleGuidance.join("\n")}
                 onChange={(e) => setPrescription({...prescription, lifestyleGuidance: e.target.value.split("\n").filter(x => x.trim())})}
                 className="w-full p-6 bg-slate-50 rounded-[28px] text-sm font-medium border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                 placeholder="Tips for daily living..."
               />
            </div>

            {/* Section: Follow-up */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-800">
                 <Clock className="w-4 h-4" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Follow-up Recommendation</h4>
               </div>
               <input 
                 value={prescription.followUp}
                 onChange={(e) => setPrescription({...prescription, followUp: e.target.value})}
                 className="bg-slate-50 px-6 py-3 rounded-xl text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20"
                 placeholder="e.g. 2 weeks"
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
