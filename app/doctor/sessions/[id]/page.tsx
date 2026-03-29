"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MessageSquare, 
  FileText, 
  Video, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  User,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Bot,
  Activity,
  CheckCircle,
  X
} from "lucide-react";
import { transcriptionService, prescriptionService } from "@/lib/services";
import api from "@/lib/api"; // Keep for appointment metadata

interface TranscriptMessage {
  speaker: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

interface Prescription {
  sessionSummary: string;
  focus: string;
  dailyExercises: string[];
  weeklyGoals: string[]; 
  lifestyleNote: string[]; // Changed to array to match lifestyleGuidance
  followUp: string;
  status: 'draft' | 'final';
}

export default function SessionReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [prescription, setPrescription] = useState<Prescription>({
    sessionSummary: "",
    focus: "",
    dailyExercises: [""],
    weeklyGoals: [""],
    lifestyleNote: [""],
    followUp: "",
    status: "draft"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [aptRes, transData, presData] = await Promise.all([
          api.get(`/api/appointments/${id}`),
          transcriptionService.getTranscription(String(id)).catch(() => ({ messages: [] })),
          prescriptionService.getPrescription(String(id)).catch(() => null)
        ]);

        if (aptRes.data.statusCode === 200) setAppointment(aptRes.data.data);
        if (transData.messages) setTranscript(transData.messages);
        if (presData) {
          const data = presData;
          setPrescription({
            sessionSummary: data.sessionSummary || "",
            focus: data.focus || "",
            dailyExercises: data.dailyExercises?.length ? data.dailyExercises : [""],
            weeklyGoals: Array.isArray(data.weeklyPractice) ? data.weeklyPractice : (data.weeklyPractice ? [data.weeklyPractice] : (data.weeklyGoals?.length ? data.weeklyGoals : [""])),
            lifestyleNote: data.lifestyleGuidance?.length ? data.lifestyleGuidance : (data.lifestyleNote?.length ? [data.lifestyleNote] : [""]),
            followUp: data.followUp || "",
            status: data.status || "draft"
          });
        }
      } catch (err) {
        console.error("Failed to fetch session details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleSavePrescription = async (isFinal = false) => {
    setSaving(true);
    try {
      const payload = {
        ...prescription,
        weeklyPractice: prescription.weeklyGoals,
        lifestyleGuidance: prescription.lifestyleNote
      };

       if (isFinal) {
        const data = await prescriptionService.finalizePrescription(String(id));
        if (data) {
          setPrescription({
            ...prescription,
            status: "final",
            ...data,
            weeklyGoals: data.weeklyPractice || data.weeklyGoals,
            lifestyleNote: data.lifestyleGuidance || data.lifestyleNote
          });
          alert("Session finalized and report signed!");
        }
      } else {
        const data = await prescriptionService.updatePrescription(String(id), payload);
        if (data) {
          alert("Draft saved successfully!");
        }
      }
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: 'dailyExercises' | 'weeklyGoals' | 'lifestyleNote') => {
    setPrescription({
      ...prescription,
      [field]: [...prescription[field], ""]
    });
  };

  const removeItem = (field: 'dailyExercises' | 'weeklyGoals' | 'lifestyleNote', index: number) => {
    const newList = [...prescription[field]];
    newList.splice(index, 1);
    setPrescription({
      ...prescription,
      [field]: newList.length ? newList : [""]
    });
  };

  const updateItem = (field: 'dailyExercises' | 'weeklyGoals' | 'lifestyleNote', index: number, value: string) => {
    const newList = [...prescription[field]];
    newList[index] = value;
    setPrescription({
      ...prescription,
      [field]: newList
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#fcfcfc]">
      <Loader2 className="w-12 h-12 text-[#22c55e] animate-spin" />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Clinical Environment...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#fcfcfc] flex flex-col overflow-hidden font-sans">
      {/* TOP STATS BAR */}
      <div className="grid grid-cols-4 gap-6 p-6 bg-white shrink-0">
        {[
          { 
            label: "SCHEDULED", 
            val: appointment ? `${new Date(appointment.startTime).toLocaleDateString([], { weekday: 'short' })}, ${new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Loading...", 
            icon: Calendar 
          },
          { label: "BOT CAPTURE", val: "Confirmed", icon: Bot },
          { label: "AI PROCESSING", val: "Completed", icon: Activity, color: "text-[#5d5dff]" },
          { label: "PRESCRIPTION", val: prescription.status === 'final' ? "Signed" : "Draft Available", icon: CheckCircle, color: "text-[#22c55e]" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#f8f9fa] border border-slate-100 rounded-[32px] p-6 flex items-center gap-4 transition-all hover:shadow-sm">
            <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center ${stat.color || 'text-slate-400'}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-sm font-black tracking-tight ${stat.color || 'text-slate-800'}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
        {/* LEFT: CLINICAL TRANSCRIPTION LOG (DARK) */}
        <div className="w-[38%] bg-[#0a0a0a] rounded-[50px] shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5d5dff] opacity-10 rounded-bl-full -mr-32 -mt-32"></div>
          
          <div className="p-8 pb-4 shrink-0 relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-8">
              <div className="w-4 h-4 rounded-md border border-slate-700"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">CLINICAL TRANSCRIPTION LOG</h2>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 space-y-10 relative z-10 scrollbar-hide py-4">
            {transcript.map((m, i) => (
              <div key={i} className="flex gap-4 group/msg">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.speaker === 'THERAPIST' ? 'bg-[#5d5dff]' : 'bg-slate-800'}`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${m.speaker === 'THERAPIST' ? 'text-[#5d5dff]' : 'text-slate-500'}`}>
                    {m.speaker}
                  </p>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed tracking-tight break-words">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
            {!transcript.length && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <RefreshCw className="w-12 h-12 text-white animate-spin mb-4" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Awaiting interaction data...</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CLINICAL EDITOR (WHITE) */}
        <div className="w-[62%] bg-white rounded-[50px] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="p-10 pb-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-2xl">
                 <Sparkles className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">CLINICAL EDITOR</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SESSION AI DRAFT</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleSavePrescription(false)}
                className="px-6 py-3 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                SAVE DRAFT
              </button>
              <button 
                onClick={() => handleSavePrescription(true)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all ${
                  prescription.status === 'final' ? 'bg-[#22c55e]' : 'bg-slate-900 hover:scale-105'
                }`}
              >
                {prescription.status === 'final' ? 'SIGN REPORT' : 'SIGN REPORT'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-12">
            {/* SESSION SUMMARY */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-slate-100 rounded-full"></div>
              <div className="pl-6 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <FileText className="w-3 h-3" /> SESSION SUMMARY
                   </h3>
                </div>
                <div className="bg-[#f8f9fa] rounded-[32px] p-8 border border-slate-50">
                  <textarea 
                    value={prescription.sessionSummary}
                    onChange={(e) => setPrescription({...prescription, sessionSummary: e.target.value})}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 leading-relaxed resize-none p-0"
                    placeholder="Summarize the key takeaways..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* CLINICAL FOCUS */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-slate-100 rounded-full"></div>
              <div className="pl-6 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Activity className="w-3 h-3" /> CLINICAL FOCUS
                   </h3>
                </div>
                <div className="bg-[#f8f9fa] rounded-[32px] p-6 border border-slate-50">
                  <textarea 
                    value={prescription.focus}
                    onChange={(e) => setPrescription({...prescription, focus: e.target.value})}
                    className="w-full bg-transparent border-none focus:ring-0 text-md font-bold italic text-slate-600 leading-relaxed resize-none p-0"
                    placeholder="Describe the therapeutic landscape..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* TWO COLUMN LISTS */}
            <div className="grid grid-cols-2 gap-12">
              {/* DAILY EXERCISES */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DAILY EXERCISES</h3>
                <div className="space-y-4">
                  {prescription.dailyExercises.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-200 transition-all flex items-center">
                        <input 
                          value={item}
                          onChange={(e) => updateItem('dailyExercises', idx, e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600 placeholder:text-slate-300"
                          placeholder="Set aside a few moments..."
                        />
                        <button onClick={() => removeItem('dailyExercises', idx)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => addItem('dailyExercises')}
                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-slate-200 hover:text-slate-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> ADD ITEM
                  </button>
                </div>
              </div>

              {/* WEEKLY GOALS */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WEEKLY GOALS</h3>
                <div className="space-y-4">
                  {prescription.weeklyGoals.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-200 transition-all flex items-center">
                        <input 
                          value={item}
                          onChange={(e) => updateItem('weeklyGoals', idx, e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600 placeholder:text-slate-300"
                          placeholder="Reflect on a recent situation..."
                        />
                        <button onClick={() => removeItem('weeklyGoals', idx)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => addItem('weeklyGoals')}
                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-slate-200 hover:text-slate-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> ADD ITEM
                  </button>
                </div>
              </div>
            </div>

            {/* LIFESTYLE GUIDANCE */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LIFESTYLE GUIDANCE</h3>
              <div className="space-y-4">
                {prescription.lifestyleNote.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-200 transition-all flex items-center">
                      <input 
                        value={item}
                        onChange={(e) => updateItem('lifestyleNote', idx, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600 placeholder:text-slate-300"
                        placeholder="Establish healthy boundaries..."
                      />
                      <button onClick={() => removeItem('lifestyleNote', idx)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addItem('lifestyleNote')}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-slate-200 hover:text-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> ADD ITEM
                </button>
              </div>
            </div>

            {/* BOTTOM DRAFT NOTE */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            {/* SUGGESTED READING (Aesthetic Books) */}
            <div className="pt-12 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#5d5dff] rounded-full"></div>
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">SUGGESTED CLINICAL READING</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { title: "Cognitive Resonance", img: "/assets/books/aesthetic_clinical_books_1_1774787659003.png" },
                  { title: "Behavioral Patterns", img: "/assets/books/aesthetic_clinical_books_2_1774787678075.png" },
                  { title: "Therapeutic Alliances", img: "/assets/books/aesthetic_clinical_books_3_1774787695784.png" }
                ].map((book, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-sm mb-3">
                      <img 
                        src={book.img} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate px-1">{book.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 px-1 truncate">Clinical Resource</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
