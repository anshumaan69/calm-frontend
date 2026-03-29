"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  CalendarDays,
  History
} from "lucide-react";
import api from "@/lib/api";

interface TimeRange {
  start: string;
  end: string;
}

interface FixtureMap {
  [key: string]: TimeRange[];
}

export default function SchedulePage() {
  const [fixtures, setFixtures] = useState<FixtureMap>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeDay, setActiveDay] = useState("Monday");

  // Overrides state (Vacation/Block Out)
  const [override, setOverride] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await api.get('/api/slots/doctor/me');
        if (res.data.statusCode === 200 || res.data.success) {
          const rawData = res.data.data?.fixtures || res.data.data || [];
          const base: FixtureMap = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
          };
          
          if (Array.isArray(rawData)) {
            rawData.forEach((item: any) => {
              if (item.day && base[item.day]) {
                base[item.day] = item.ranges || [];
              }
            });
          } else if (typeof rawData === 'object') {
            Object.assign(base, rawData);
          }
          
          setFixtures(base);
        }
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, []);

  const addSlot = (day: string) => {
    const newFixtures = { ...fixtures };
    newFixtures[day] = [...newFixtures[day], { start: "09:00", end: "10:00" }];
    setFixtures(newFixtures);
  };

  const removeSlot = (day: string, index: number) => {
    const newFixtures = { ...fixtures };
    newFixtures[day] = newFixtures[day].filter((_, i) => i !== index);
    setFixtures(newFixtures);
  };

  const updateSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newFixtures = { ...fixtures };
    newFixtures[day][index][field] = value;
    setFixtures(newFixtures);
  };

  const saveFixtures = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Transform object map to array of day objects
      const fixturesArray = Object.entries(fixtures).map(([day, ranges]) => ({
        day,
        ranges
      }));
      
      console.log("Saving fixtures array:", fixturesArray);
      const res = await api.patch('/api/slots/fixtures', { fixtures: fixturesArray });
      
      if (res.data.statusCode === 200 || res.data.success) {
        setMessage({ type: 'success', text: "Weekly availability updated successfully!" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to save availability. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!override.date || !override.startTime || !override.endTime) return;
    
    setSaving(true);
    try {
      const res = await api.post('/api/slots/override', override);
      if (res.data.statusCode === 200) {
        setMessage({ type: 'success', text: "Block-out period created successfully!" });
        setOverride({ date: "", startTime: "", endTime: "", reason: "" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to create block-out. Check date/time." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Loading your calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Manage Schedule</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Configure your weekly availability and vacation blocks</p>
        </div>
        <button 
          onClick={saveFixtures}
          disabled={saving}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving Changes..." : "Save Weekly Map"}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-xs font-bold uppercase tracking-wider">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Weekly Fixtures Editor */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 p-6 flex items-center justify-between border-b border-slate-100 px-10">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Standard Weekly Availability
              </h3>
            </div>
            
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Day Selector */}
              <div className="w-full md:w-64 border-r border-slate-100 p-6 space-y-2">
                {Object.keys(fixtures).map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`w-full px-6 py-4 rounded-2xl text-left text-xs font-black transition-all flex items-center justify-between group ${
                      activeDay === day 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    }`}
                  >
                    {day}
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] ${activeDay === day ? 'bg-white/20' : 'bg-slate-100'}`}>
                      {fixtures[day].length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Slots List */}
              <div className="flex-1 p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{activeDay}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Define your recurring sessions</p>
                  </div>
                  <button 
                    onClick={() => addSlot(activeDay)}
                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {fixtures[activeDay].length > 0 ? (
                    fixtures[activeDay].map((range, i) => (
                      <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                            <input 
                              type="time" 
                              value={range.start}
                              onChange={(e) => updateSlot(activeDay, i, 'start', e.target.value)}
                              className="w-full h-12 bg-white rounded-2xl px-4 text-xs font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                            <input 
                              type="time" 
                              value={range.end}
                              onChange={(e) => updateSlot(activeDay, i, 'end', e.target.value)}
                              className="w-full h-12 bg-white rounded-2xl px-4 text-xs font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => removeSlot(activeDay, i)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end mb-1"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 text-slate-200" />
                       </div>
                       <p className="text-sm font-black text-slate-800">No slots defined for {activeDay}</p>
                       <p className="text-xs font-bold text-slate-400 mt-1 max-w-[200px]">Click the plus icon to add your availability for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overrides & Vacation Blocks */}
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8 h-fit">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Vacation / Custom Block
            </h3>
            
            <form onSubmit={handleOverrideSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Date</label>
                <input 
                  type="date" 
                  required
                  value={override.date}
                  onChange={(e) => setOverride({ ...override, date: e.target.value })}
                  className="w-full h-14 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                  <input 
                    type="time" 
                    required
                    value={override.startTime}
                    onChange={(e) => setOverride({ ...override, startTime: e.target.value })}
                    className="w-full h-14 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                  <input 
                    type="time" 
                    required
                    value={override.endTime}
                    onChange={(e) => setOverride({ ...override, endTime: e.target.value })}
                    className="w-full h-14 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Conference"
                  value={override.reason}
                  onChange={(e) => setOverride({ ...override, reason: e.target.value })}
                  className="w-full h-14 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {saving ? "Processing..." : "Create Block Out"}
              </button>
            </form>

            <div className="pt-8 border-t border-slate-50">
               <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logic Note</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    Overrides strictly block slots from being generated for the chosen time range on that specific date, regardless of weekly fixtures.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
