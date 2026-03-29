"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import { CheckCircle2, AlertCircle, Loader2, Star, ArrowRight } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Doctor {
  _id: string;
  name: string;
  email: string;
  status: string;
  isActive: boolean;
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isManuallyBlocked: boolean;
}

interface SelectedSlot {
  id: string;
  time: string;       // display label
  startTime: string;  // raw value from API
  endTime: string;    // raw value from API
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter();
  // Navigation
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  // Calendar
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());

  // Slots — single source of truth
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  // Form
  const [meetingType, setMeetingType] = useState("GOOGLE_MEET");
  const [formData, setFormData] = useState({
    firstName: "", email: "", phone: "",
    problem: "", duration: "", guestEmails: ""
  });

  // Upsells
  const [masterclass, setMasterclass] = useState(false);
  const [cart, setCart] = useState<string[]>([]);
  const [apiBooks, setApiBooks] = useState<any[]>([]);
  const [apiCourses, setApiCourses] = useState<any[]>([]);

  // Fallback books  
  const fallbackBooks = [
    { _id: "b1", title: "Standing Out", price: 499, image: "/book-standing-out.png" },
    { _id: "b2", title: "Create vs Copy", price: 499, image: "/book-create-vs-copy.png" },
    { _id: "b3", title: "Standing Out", price: 499, image: "/book-standing-out.png" },
    { _id: "b4", title: "Create vs Copy", price: 499, image: "/book-create-vs-copy.png" },
  ];

  const displayBooks = apiBooks.length > 0 ? apiBooks : fallbackBooks;

  const totalPrice = 999 +
    (masterclass ? 1500 : 0) +
    cart.reduce((sum, id) => {
      const b = displayBooks.find(b => b._id === id);
      return sum + (b?.price || 499);
    }, 0);

  // ── Fetch doctors on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/users/doctors");
        const data = res.data?.data || [];
        const active = data.filter((d: Doctor) => d.status === "APPROVED" && d.isActive);
        setDoctors(active);
      } catch {
        setError("Could not load therapist list. Please refresh.");
      }
    })();

    (async () => {
      try {
        const [bRes, cRes] = await Promise.allSettled([
          api.get("/api/books"),
          api.get("/api/courses"),
        ]);
        if (bRes.status === "fulfilled") setApiBooks(bRes.value.data?.data || []);
        if (cRes.status === "fulfilled") setApiCourses(cRes.value.data?.data || []);
      } catch { /* use fallback */ }
    })();
  }, []);

  // ── Fetch slots whenever doctor OR date changes ───────────────────────────
  const fetchSlots = useCallback(async (doc: Doctor, y: number, m: number, d: number) => {
    setSlotsLoading(true);
    setSelectedSlot(null);      // reset selection when context changes
    setError(null);
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    try {
      const res = await api.get(`/api/slots?doctorId=${doc._id}&date=${dateStr}`);
      const data: Slot[] = res.data?.data || [];
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!doctor) return;
    fetchSlots(doctor, year, month, day);
  }, [doctor, year, month, day, fetchSlots]);

  // ── Razorpay loader ───────────────────────────────────────────────────────
  const loadRazorpay = (): Promise<boolean> =>
    new Promise(resolve => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // ── Pay & Confirm ─────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!doctor || !selectedSlot) {
      setError("Please select a therapist and time slot.");
      return;
    }
    setLoading(true);
    setError(null);

    const sdkReady = await loadRazorpay();
    if (!sdkReady) {
      setError("Razorpay SDK failed to load. Check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Step 1 — Create appointment
      // Backend does new Date(startTime).getHours() — bare "14:08" is invalid.
      // We must send a full ISO datetime string.
      const toISO = (date: string, time: string): string => {
        if (!time) return "";
        // Already a full ISO string
        if (time.includes("T")) return time;
        // HH:MM format → combine with date + IST offset
        if (/^\d{1,2}:\d{2}$/.test(time)) {
          const [h, m] = time.split(":").map(Number);
          return `${date}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00+05:30`;
        }
        // "9:00 AM" format → convert to 24h then combine
        const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
          let h = parseInt(match[1]);
          const mins = match[2];
          if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
          if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
          return `${date}T${String(h).padStart(2,"0")}:${mins}:00+05:30`;
        }
        return `${date}T${time}:00+05:30`;
      };

      const startISO = toISO(dateStr, selectedSlot.startTime);
      const endISO = toISO(dateStr, selectedSlot.endTime);

      console.log("Appointment payload:", { dateStr, startISO, endISO, slotId: selectedSlot.id, rawStart: selectedSlot.startTime });

      const aptRes = await api.post("/api/appointments", {
        doctorId: doctor._id,
        date: dateStr,
        slotId: selectedSlot.id,
        startTime: startISO,
        endTime: endISO || undefined,
        problemDescription: formData.problem,
        problemDuration: formData.duration,
        meetingType,
        guestEmails: formData.guestEmails
          ? formData.guestEmails.split(",").map(e => e.trim()).filter(Boolean)
          : [],
      });
      const appointmentId = aptRes.data?.data?._id;
      if (!appointmentId) throw new Error("Appointment creation failed.");
      console.log("Created appointment:", appointmentId);

      // Step 2 — Checkout order
      const checkoutRes = await api.post("/api/checkout/create", {
        appointmentId,
        books: cart.map(id => ({ bookId: id, type: "DIGITAL" })),
        courseIds: masterclass && apiCourses[0] ? [apiCourses[0]._id] : [],
      });
      const order = checkoutRes.data?.data;
      console.log("Checkout order response:", order);
      if (!order?.razorpayOrderId) throw new Error("Could not create payment order.");

      // Step 3 — Open Razorpay
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: Math.round(Number(order.amount)),
        currency: order.currency || "INR",
        name: "Calmscious",
        description: "Therapy Session",
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verifyPayload = {
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              orderId: response.razorpay_order_id || order._id || order.id || order.orderId || order.razorpayOrderId,
            };
            console.log("Verify payload:", verifyPayload);
            const verifyRes = await api.post("/api/checkout/verify", verifyPayload);
            console.log("Verify response:", verifyRes.data);
            if (verifyRes.data?.success || verifyRes.data?.statusCode === 200) {
              const verifyData = verifyRes.data?.data;
              console.log("Full verify data:", JSON.stringify(verifyData, null, 2));
              
              // Extract appointment ID from items array per backend contract
              const appointmentItem = verifyData?.items?.find((i: any) => i.type === "APPOINTMENT");
              const verifiedAptId = appointmentItem?.itemId || verifyData?.appointment?._id || verifyData?._id;
              
              console.log("Extracted appointment ID:", verifiedAptId);
              
              if (verifiedAptId) {
                router.push(`/success/${verifiedAptId}`);
              } else {
                // Fallback if ID is missing (should not happen with verifiedAptId check)
                setStep(3);
              }
            } else {
              setError(`Verification failed: ${verifyRes.data?.message || "Unknown error"}`);
            }
          } catch (err: any) {
            console.error("Verify error:", err.response?.data || err);
            setError(`Verification error: ${err.response?.data?.message || err.message}`);
          }
        },
        prefill: { name: formData.firstName, email: formData.email, contact: formData.phone },
        theme: { color: "#22d3ee" },
      });
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // ── Mock fallback slots ───────────────────────────────────────────────────
  const mockTimes = ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex font-sans">

      {/* ── Sidebar ── */}
      <div className="hidden lg:flex w-[340px] shrink-0 flex-col bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 opacity-80" />
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="relative w-14 h-14 mb-16 block">
            <Image src="/logo-brain.png" alt="Logo" fill className="object-contain" sizes="56px" />
          </Link>
          <h1 className="text-4xl font-black leading-[1.1] tracking-tight mb-6">
            {doctor ? `Session with ${doctor.name}` : "Book a Consultation"}
          </h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Your personalised mental wellness journey starts here. Select a specialist, pick a time, and we'll handle the rest.
          </p>

          {selectedSlot && (
            <div className="mt-auto p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Your Selection</p>
              <p className="text-white font-black text-lg">
                {new Date(year, month, day).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
              </p>
              <p className="text-cyan-400 font-black text-2xl mt-1">{selectedSlot.time}</p>
            </div>
          )}

          {/* Step indicators */}
          <div className="mt-8 space-y-3">
            {["Select Specialist","Choose Time","Add Details","Confirm & Pay"].map((label, i) => (
              <div key={i} className={`flex items-center gap-3 ${step === i ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 ${step === i ? "bg-cyan-400 border-cyan-400 text-slate-900" : step > i ? "bg-white/10 border-white/10" : "bg-transparent border-white/20 text-white/60"}`}>
                  {step > i ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : i + 1}
                </div>
                <span className={`text-sm font-bold ${step === i ? "text-white" : "text-slate-500"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── STEP 0: Doctor Selection ── */}
        {step === 0 && (
          <div className="p-8 lg:p-16 max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Select your Specialist</h2>
              <p className="text-slate-400 text-sm mt-2">Choose a therapist to begin your journey</p>
            </div>

            {doctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 rounded-[40px] bg-slate-50 border border-dashed border-slate-200">
                <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Loading specialists...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctors.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => { setDoctor(doc); setStep(1); }}
                    className="p-8 rounded-[32px] border-2 border-slate-100 bg-white text-left transition-all duration-300 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-50 group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[20px] bg-slate-100 flex items-center justify-center font-black text-2xl text-slate-300 group-hover:bg-cyan-400 group-hover:text-white transition-all duration-300">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800">{doc.name}</h3>
                        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-0.5">Mental Wellness Coach</p>
                        <div className="flex items-center gap-1.5 mt-3">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs text-slate-400 font-semibold">Available Today</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Date & Time ── */}
        {step === 1 && (
          <div className="p-8 lg:p-16 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <button onClick={() => setStep(0)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select a Date & Time</h2>
                <button onClick={() => setStep(0)} className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:underline">
                  Change: {doctor?.name}
                </button>
              </div>
              <span className="ml-auto px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">60 min</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Calendar */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                {/* Month + Nav */}
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="font-black text-slate-800">{MONTHS[month]} {year}</span>
                  <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isSelected = d === day && month === month && year === year;
                    return (
                      <button
                        key={d}
                        disabled={isPast}
                        onClick={() => setDay(d)}
                        className={`h-10 w-10 mx-auto rounded-xl text-sm font-bold transition-all duration-200 ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-lg scale-110"
                            : isPast
                            ? "text-slate-200 cursor-not-allowed"
                            : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">
                      {new Date(year, month, day).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GMT+05:30</p>
                  </div>
                  {slotsLoading && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {slotsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                    ))
                  ) : slots.length > 0 ? (
                    slots.map(slot => {
                      const isSelected = selectedSlot?.id === slot._id;
                      const isDisabled = slot.isBooked || slot.isManuallyBlocked;
                      return (
                        <button
                          key={slot._id}
                          disabled={isDisabled}
                          onClick={() => setSelectedSlot({ id: slot._id, time: slot.startTime, startTime: slot.startTime, endTime: slot.endTime })}
                          className={`py-4 px-2 rounded-2xl border-2 text-xs font-black transition-all duration-200 ${
                            isDisabled
                              ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                              : isSelected
                              ? "border-cyan-400 bg-cyan-400 text-white shadow-lg shadow-cyan-200 scale-105"
                              : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-600 hover:scale-105 active:scale-95"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })
                  ) : (
                    mockTimes.map((time, i) => {
                      const isSelected = selectedSlot?.id === `mock_${i}`;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot({ id: `mock_${i}`, time, startTime: time, endTime: "" })}
                          className={`py-4 px-2 rounded-2xl border-2 text-xs font-black transition-all duration-200 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-400 text-white shadow-lg shadow-cyan-200 scale-105"
                              : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-600 hover:scale-105 active:scale-95"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })
                  )}
                </div>

                {error && (
                  <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!selectedSlot) { setError("Please select a time slot."); return; }
                    setError(null);
                    setStep(2);
                  }}
                  className={`w-full mt-8 py-5 rounded-2xl font-black text-base transition-all duration-300 ${
                    selectedSlot
                      ? "bg-cyan-400 text-white shadow-xl shadow-cyan-200 hover:bg-cyan-500 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {selectedSlot ? `Confirm — ${selectedSlot.time}` : "Select a time slot"}
                </button>
                <p className="text-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Review Details on Next Step</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Details + Upsell + Pay ── */}
        {step === 2 && (
          <div className="p-8 lg:p-16 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <button onClick={() => setStep(1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add Details</h2>
            </div>

            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { label: "First Name*", name: "firstName", type: "text", placeholder: "Your name" },
                  { label: "Phone*", name: "phone", type: "tel", placeholder: "+91 00000 00000" },
                  { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
                  { label: "Guest Emails", name: "guestEmails", type: "text", placeholder: "Comma separated" },
                ].map(f => (
                  <div key={f.name} className="space-y-1.5">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
                      value={(formData as any)[f.name]}
                      onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-400 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Describe your issue*</label>
                <textarea
                  name="problem"
                  placeholder="Briefly describe your challenge..."
                  value={formData.problem}
                  onChange={e => setFormData({ ...formData, problem: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest">How long? *</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 6 months"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Meeting Type */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Meeting Type</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Google Meet", value: "GOOGLE_MEET" },
                    { label: "Inbound Call", value: "INBOUND_CALL" },
                    { label: "In Office", value: "IN_OFFICE" },
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMeetingType(m.value)}
                      className={`px-5 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        meetingType === m.value
                          ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Masterclass Upsell ── */}
            <div className="mt-12 pt-10 border-t border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">Add Masterclass (Optional)</h3>
              <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex gap-6 items-center mb-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                  <Image src="/masterclass.png" alt="Masterclass" fill className="object-cover" sizes="96px" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">{apiCourses[0]?.title || "Depression Management Masterclass"}</h4>
                  <p className="text-sm text-slate-400 mt-1">48 hours · Online</p>
                  <p className="text-cyan-500 font-black mt-2">₹1,500</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMasterclass(true)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${masterclass ? "bg-cyan-400 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>Yes, Add It</button>
                <button onClick={() => setMasterclass(false)} className={`flex-1 py-4 rounded-2xl font-black text-sm border-2 transition-all ${!masterclass ? "border-cyan-400 text-cyan-500" : "border-slate-200 text-slate-300 hover:border-slate-300"}`}>No Thanks</button>
              </div>
            </div>

            {/* ── Books ── */}
            <div className="mt-12 pt-10 border-t border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">Add Books (Optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayBooks.map(book => {
                  const isInCart = cart.includes(book._id);
                  return (
                    <div key={book._id} className="group">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-slate-100 border-2 border-transparent group-hover:border-cyan-300 transition-all">
                        <Image src={book.image || "/book1.png"} alt={book.title} fill className="object-cover" sizes="150px" />
                      </div>
                      <p className="text-xs font-black text-slate-700 line-clamp-1 mb-1">{book.title}</p>
                      <p className="text-sm font-black text-slate-800 mb-2">₹{book.price}</p>
                      <button
                        onClick={() => setCart(prev => prev.includes(book._id) ? prev.filter(id => id !== book._id) : [...prev, book._id])}
                        className={`w-full py-2 rounded-xl text-xs font-black transition-all ${isInCart ? "bg-cyan-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-cyan-100 hover:text-cyan-700"}`}
                      >
                        {isInCart ? "✓ Added" : "Add to cart"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Pay Button ── */}
            {error && (
              <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-12">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter">₹ {totalPrice}</p>
              </div>
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full md:w-auto px-12 py-5 bg-cyan-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-cyan-200 hover:bg-cyan-500 hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:scale-100 flex items-center gap-3"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Processing..." : "Pay & Confirm"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Success Fallback ── */}
        {step === 3 && (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-cyan-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Booking Success!</h2>
            <p className="text-slate-400 mb-8 max-w-sm">Redirecting you to your session confirmation card...</p>
            <Link href="/patient/library" className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all">
              View My Library
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
