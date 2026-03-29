"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import api from "@/lib/api";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);

  // Fetch appointment data with polling for meetLink/receiptPath
  useEffect(() => {
    if (!appointmentId) return;

    const fetchSession = async () => {
      try {
        const res = await api.get(`/api/appointments/${appointmentId}`);
        const apt = res.data?.data;
        setData(apt);
        setLoading(false);

        // Stop polling if status is explicitly FAILED or if we have everything
        if (apt?.status === "FAILED") {
          console.warn("Appointment marked as FAILED by backend");
          return;
        }

        // Continue polling if meetLink or receiptPath is missing (max 10 retries)
        if ((!apt?.meetLink || !apt?.receiptPath) && retries < 10) {
          setTimeout(() => setRetries(prev => prev + 1), 3000);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setLoading(false);
      }
    };

    fetchSession();
  }, [appointmentId, retries]);

  // Render Barcode
  useEffect(() => {
    const barcodeVal = data?.orderId || data?._id || appointmentId;
    if (barcodeVal && typeof window !== "undefined") {
      import("jsbarcode").then(({ default: JsBarcode }) => {
        try {
          const el = document.getElementById("barcode-svg");
          if (el) {
            JsBarcode(el, String(barcodeVal).slice(-12), {
              format: "CODE128",
              width: 1.5,
              height: 40,
              displayValue: false,
              margin: 0,
            });
          }
        } catch (e) {
          console.error("Barcode error:", e);
        }
      });
    }
  }, [data, appointmentId]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Finalizing your session...</p>
      </div>
    );
  }

  // Fallback values
  const doctorName = data?.doctorName || data?.doctor?.name || "Specialist";
  const startTime = data?.startTime ? new Date(data.startTime) : new Date();
  const fee = data?.fee || data?.amount || 0;
  const patientName = data?.patientName || "Sarah Glayre";
  const patientPhone = data?.patientPhone || data?.patient?.phone || "—";
  const meetLink = data?.meetLink || "";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 md:p-12 font-sans">
      
      {/* Container */}
      <div className="flex flex-col lg:flex-row bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/60 max-w-[900px] w-full min-h-[600px] border border-slate-100">
        
        {/* LEFT COLUMN: BRANDING */}
        <div className="lg:w-[42%] bg-[#B2EBF2] p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <Link href="/" className="bg-white w-16 h-16 rounded-[20px] flex items-center justify-center mb-10 shadow-lg hover:scale-105 transition-transform">
              <Image src="/logo-brain.png" alt="Logo" width={40} height={40} className="object-contain" />
            </Link>
            <h1 className="text-[#004D40] text-4xl font-extrabold leading-[1.1] tracking-tight">
              Consultation &<br /> Calmscious Session
            </h1>
          </div>
          
          <div className="relative z-10 space-y-4">
            <h3 className="text-[#004D40] text-xl font-black">
              What Happens When You Book a calmscious Appointment
            </h3>
            <p className="text-[#004D40]/60 text-sm leading-relaxed font-medium">
              From your very first appointment, you are paired with a dedicated Calmscious 
              specialist who stays with you. Your experiences are carefully understood 
              and translated into a clear personal Calmscious Report.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="lg:w-[58%] p-10 lg:p-14 flex flex-col relative bg-white">
          
          {/* Barcode top right */}
          <div className="absolute top-10 right-10">
            <svg id="barcode-svg"></svg>
          </div>

          {/* Doctor Identity */}
          <div className="flex items-center gap-5 mb-10 mt-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 font-black text-2xl border border-slate-200 overflow-hidden shadow-sm">
              {data?.doctorImage ? (
                <img src={data.doctorImage} alt={doctorName} className="w-full h-full object-cover" />
              ) : (
                doctorName.charAt(0)
              )}
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xl tracking-tight">{doctorName}</h4>
              <p className="text-[10px] text-cyan-500 font-extrabold uppercase tracking-widest">Wellness Coach</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="space-y-4 text-sm border-t border-slate-100 pt-8 flex-1">
            <div className="flex justify-between items-center group">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Date & Hour</span>
              <span className="font-black text-slate-800 text-base">
                {format(startTime, 'MMMM dd, yyyy | p')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Service</span>
              <span className="font-black text-slate-800">State of mind</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Duration</span>
              <span className="font-black text-slate-800">1 Hour</span>
            </div>
            
            <div className="border-t border-slate-50 my-6" />
            
            <div className="flex justify-between items-end">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest pb-1">Total Paid</span>
              <span className="font-black text-slate-900 text-3xl tracking-tighter">₹{fee}</span>
            </div>
            
            <div className="border-t border-slate-50 my-6" />
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Name</span>
              <span className="font-black text-slate-800">{patientName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Phone Number</span>
              <span className="font-black text-slate-800">{patientPhone}</span>
            </div>
            
            {/* Meeting Link Highlight Card */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-cyan-50/60 p-5 rounded-[24px] border border-cyan-100/50 gap-3">
              <span className="text-cyan-600/60 font-black uppercase text-[10px] tracking-widest shrink-0">Meeting Link</span>
              {data?.status === "FAILED" || data?.status === "EXPIRED" ? (
                <span className="text-red-500 font-bold text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Booking Failed - Contact Support
                </span>
              ) : meetLink ? (
                <a 
                  href={meetLink.startsWith('http') ? meetLink : `https://${meetLink}`} 
                  target="_blank" 
                  className="text-cyan-500 font-black text-sm underline truncate max-w-full hover:text-cyan-600 transition-colors"
                >
                  {meetLink.replace('https://', '')}
                </a>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold italic">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Link is being generated...
                </div>
              )}
            </div>
          </div>

          {/* Main CTAs */}
          <div className="mt-10 space-y-4">
            <button 
              onClick={() => {
                if (data?.receiptPath) {
                  window.open(data.receiptPath, "_blank");
                } else {
                  window.print();
                }
              }} 
              disabled={!data}
              className="group w-full bg-[#00BCD4] text-white py-5 rounded-[22px] font-black text-lg shadow-xl shadow-cyan-200 hover:bg-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Download E-Receipt
            </button>
            
            <div className="flex gap-4">
              <Link 
                href="/patient/library" 
                className="flex-1 bg-slate-900 text-white py-4 rounded-[18px] font-black text-sm text-center hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Go to My Library
              </Link>
              <Link 
                href="/" 
                className="px-6 bg-white text-slate-400 border border-slate-200 rounded-[18px] flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
