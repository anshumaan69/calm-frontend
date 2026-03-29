"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, 
  Video, 
  Download, 
  ExternalLink, 
  Loader2, 
  Search,
  Book,
  PlayCircle,
  FileText,
  Calendar,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";

interface PurchasedBook {
  _id: string;
  title: string;
  image: string;
  type: 'DIGITAL' | 'PHYSICAL';
}

interface PurchasedCourse {
  _id: string;
  title: string;
  image: string;
  videoUrl?: string;
}

export default function PatientLibrary() {
  const [books, setBooks] = useState<PurchasedBook[]>([]);
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const [booksRes, coursesRes, aptRes] = await Promise.all([
          api.get('/api/books/my/books'),
          api.get('/api/courses/my/courses'),
          api.get('/api/appointments/patient/me').catch(() => ({ data: { data: [] } }))
        ]);
        
        if (booksRes.data.statusCode === 200) setBooks(booksRes.data.data);
        if (coursesRes.data.statusCode === 200) setCourses(coursesRes.data.data);
        if (aptRes.data.statusCode === 200) setAppointments(aptRes.data.data);
      } catch (err) {
        console.error("Failed to fetch library:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const handleDownload = async (bookId: string) => {
    setDownloading(bookId);
    try {
      const res = await api.get(`/api/books/${bookId}/content`);
      if (res.data.statusCode === 200 && res.data.data.url) {
        window.open(res.data.data.url, '_blank');
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Unable to fetch secure download link.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Syncing your library...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <header className="mb-16">
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter">My Library</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Access your purchased books, masterclasses and session reports</p>
        </header>

        {/* Session Reports Section */}
        {appointments.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Session Reports & Roadmaps</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED').map((apt) => (
                <Link 
                  key={apt._id} 
                  href={`/patient/session-report/${apt._id}`}
                  className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                       <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session on</p>
                      <p className="font-black text-slate-800">{new Date(apt.startTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">View Report</span>
                    <Sparkles className="w-4 h-4 text-primary fill-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Courses Section */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <Video className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Masterclasses</h2>
          </div>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                  <div className="relative aspect-video overflow-hidden">
                    {course.image && (
                       <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <PlayCircle className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-6 line-clamp-1">{course.title}</h3>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                       Watch Now
                       <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-16 border-2 border-dashed border-slate-100 text-center">
               <p className="text-slate-400 font-bold">You haven&apos;t enrolled in any masterclasses yet.</p>
            </div>
          )}
        </section>

        {/* Books Section */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Digital Books & Guides</h2>
          </div>

          {books.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {books.map((book) => (
                <div key={book._id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden bg-white shadow-sm border border-slate-100 mb-6 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2">
                    {book.image ? (
                       <Image src={book.image} alt={book.title} fill className="object-cover" />
                    ) : (
                       <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                         <Book className="w-12 h-12" />
                       </div>
                    )}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 line-clamp-2 mb-3 px-1 group-hover:text-primary transition-colors">{book.title}</h3>
                  <div className="px-1 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{book.type}</span>
                    {book.type === 'DIGITAL' && (
                       <button 
                         onClick={() => handleDownload(book._id)}
                         disabled={!!downloading}
                         className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                       >
                         {downloading === book._id ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                         ) : (
                           <Download className="w-4 h-4" />
                         )}
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-16 border-2 border-dashed border-slate-100 text-center">
               <p className="text-slate-400 font-bold">Your book collection is empty.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
