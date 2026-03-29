import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Calmscious Logo"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            style={{ height: "auto" }}
          />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:text-primary transition-colors">Home</a>
          <a href="#" className="hover:text-primary transition-colors">Features</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <Link href="/login" className="text-slate-600 hover:text-primary transition-colors font-bold mr-2 text-sm">
            Login
          </Link>
          <Link href="/book" className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-105">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-hero.png"
            alt="Mindful Background"
            fill
            className="object-cover opacity-60 md:opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
          <div className="absolute inset-0 bg-hero-gradient opacity-40"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 glass rounded-full text-xs font-bold tracking-widest uppercase text-primary animate-fade-in">
            Elevate Your Consciousness
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-tight">
            Find Your <span className="text-gradient">Inner Calm</span> <br />
            with Calmscious
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed">
            Discover a mindful approach to consciousness and mental well-being. 
            Join thousands of individuals finding balance in their daily lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/book" className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:bg-secondary hover:scale-105 transition-all duration-300 text-center">
              Start Your Journey
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 glass font-bold rounded-2xl hover:bg-foreground/5 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Problem Awareness Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Image Collage */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-2xl transform hover:-rotate-2 transition-transform duration-500">
                <Image src="/collage-1.png" alt="Mood 1" fill className="object-cover" />
              </div>
              <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl transform hover:rotate-2 transition-transform duration-500">
                <Image src="/collage-3.png" alt="Mood 3" fill className="object-cover" />
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-2xl transform hover:rotate-2 transition-transform duration-500">
                <Image src="/collage-2.png" alt="Mood 2" fill className="object-cover" />
              </div>
              <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl transform hover:-rotate-2 transition-transform duration-500">
                <Image src="/collage-4.png" alt="Mood 4" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#1e293b] leading-tight">
              Feeling lost, stressed, or alone?
            </h2>
            <p className="text-xl md:text-2xl font-bold text-[#334155] mb-8 leading-relaxed">
              Stress, anxiety, sadness, or emotional numbness <br className="hidden md:block" />
              can make life feel heavy and isolating.
            </p>
            
            <div className="space-y-6 mb-10">
              <p className="text-foreground/60 font-medium">You&apos;re not alone if you&apos;re experiencing:</p>
              <ul className="space-y-4">
                {[
                  "Loss of interest or emotional numbness",
                  "Constant irritation or anger",
                  "Frequent panic or anxious thoughts",
                  "A lingering sense of fear or unease"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80 font-medium">
                    <span className="w-1.5 h-1.5 bg-[#22d3ee] rounded-full shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-foreground/80 font-semibold italic">
                With compassionate, expert-led care, relief is possible.
              </p>
            </div>

            <Link href="/book" className="px-10 py-4 bg-[#22d3ee] text-white font-black text-xl rounded-2xl shadow-xl shadow-cyan-200 dark:shadow-cyan-900/20 hover:scale-105 hover:bg-[#0891b2] transition-all duration-300 text-center">
              Book a session
            </Link>
          </div>
        </div>
      </section>

      {/* Therapy Programs Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-[#1e293b] leading-tight max-w-2xl">
            Comprehensive Therapy Programs to <br />
            Meet Your Needs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Individual Therapy", image: "/program-1.jpg" },
              { title: "Couple Therapy", image: "/program-2.jpg" },
              { title: "Family Therapy", image: "/program-3.jpg" }
            ].map((program, i) => (
              <div 
                key={i} 
                className="group relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
              >
                <Image 
                  src={program.image} 
                  alt={program.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-3xl font-black text-white leading-tight tracking-tight">
                    {program.title.split(' ')[0]} <br />
                    {program.title.split(' ')[1]}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dr. Mehar Section */}
      <section className="py-24 bg-white dark:bg-[#050b14] overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left: Dr. Mehar Portrait */}
            <div className="w-full lg:w-2/5">
              <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl group">
                <Image 
                  src="/dr-mehar.png" 
                  alt="Dr. Mehar" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[40px]"></div>
              </div>
            </div>

            {/* Right: Content & Info Boxes */}
            <div className="w-full lg:w-3/5">
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#1e293b] leading-tight">
                  Dr. Mehar&apos;s Calmscious Therapy
                </h2>
                <p className="text-2xl md:text-3xl font-bold text-foreground/70 leading-relaxed max-w-2xl">
                  A calm, practical approach to lasting emotional well-being
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "What You'll Experience",
                    icon: "🧘",
                    items: ["Calm, clear thinking", "Emotional balance under stress", "Better focus and confidence", "A steady sense of inner control"],
                    color: "border-cyan-200"
                  },
                  {
                    title: "Why Calmscious Works",
                    icon: "⚙️",
                    items: ["Drug-free, practical therapy approach", "Guided by 15+ years of clinical experience", "Focused on emotional stability, not quick fixes", "Designed for lasting, real-life change"],
                    color: "border-cyan-200"
                  },
                  {
                    title: "Who It's For",
                    icon: "👥",
                    items: ["Stress & emotional overwhelm", "Anxiety and overthinking", "Relationship challenges", "Difficulty managing emotions"],
                    color: "border-cyan-200"
                  }
                ].map((box, i) => (
                  <div key={i} className={`p-8 rounded-[32px] border-2 ${box.color} bg-white flex flex-col items-center text-center hover:shadow-xl hover:border-primary transition-all duration-300`}>
                    <div className="text-5xl mb-6">{box.icon}</div>
                    <h3 className="text-lg font-black mb-6 text-slate-800">{box.title}</h3>
                    <ul className="space-y-4 text-left w-full">
                      {box.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-[#1e293b] leading-tight">
            Exploring Paths to Mental Wellness
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              "Power of calmscious Therapy to manage Stress and Anxiety",
              "Unlock the power of your brain to manage anxiety",
              "Easy Self-Care Ideas for a Happier You",
              "Best Self-Care Ideas for a Healthier and Happier You",
              "10 Best Self-Care Ideas for Mental and Physical Wellbeing",
              "Advanced Techniques for Emotional Resilience"
            ].map((title, i) => (
              <div key={i} className="group flex flex-col bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src="/blog-thumb.png" 
                    alt={title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-black mb-3 text-slate-800 leading-tight group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <div className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                    By Dr. Mehar • August 21, 2024
                  </div>
                  <div className="mt-auto">
                    <button className="px-6 py-2.5 bg-[#22d3ee] text-white font-black rounded-xl hover:bg-[#0891b2] transition-colors text-sm shadow-md shadow-cyan-200/50">
                      Read Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey of Impact Section */}
      <section className="py-24 bg-white dark:bg-[#050b14] overflow-hidden">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-[#1e293b] leading-tight max-w-2xl">
            Celebrating Success: Dr. Mehar&apos;s <br />
            Journey of Impact
          </h2>

          <div className="relative w-full aspect-[16/11] md:aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl group">
            <Image 
              src="/journey-collage.png" 
              alt="Dr. Mehar's Journey of Impact Collage" 
              fill 
              className="object-cover group-hover:scale-[1.02] transition-transform duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-[#1e293b] leading-tight">
            Real stories real lives transformed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
              <div key={i} className="flex flex-col group transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image src="/avatar-1.jpg" alt="Avatar" fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-slate-900 leading-none">Kamal Kanan</h4>
                    <span className="text-[10px] font-medium text-slate-400 mt-1 block uppercase">20 December 2024</span>
                  </div>
                </div>
                
                <div className="flex gap-0.5 mb-3 items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-xs text-yellow-500">★</span>
                  ))}
                </div>

                <p className="text-[13px] text-slate-700 leading-relaxed mb-4 line-clamp-4 font-medium">
                  Really useful madam. I knew this, but i forgot. Now I remember this technique by joining this zoom meeting
                </p>

                <div className="">
                  <button className="text-[11px] font-black text-slate-400 hover:text-cyan-500 transition-colors uppercase tracking-widest decoration-1 underline-offset-4 decoration-transparent hover:decoration-cyan-500 underline">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA/Footer */}
      <footer className="py-20 border-t border-foreground/5 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-xs">
              <Image
                src="/logo.png"
                alt="Calmscious Logo"
                width={140}
                height={40}
                className="mb-6 w-auto"
                style={{ height: "auto" }}
              />
              <p className="text-sm text-foreground/50 leading-relaxed">
                Empowering individuals to find balance, clarity, and peace through mindful therapy and conscious living.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 text-sm">
              <div className="space-y-4">
                <h5 className="font-black uppercase tracking-widest text-[10px] text-primary">Company</h5>
                <ul className="space-y-2 text-foreground/60">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-black uppercase tracking-widest text-[10px] text-primary">Services</h5>
                <ul className="space-y-2 text-foreground/60">
                  <li><a href="#" className="hover:text-primary transition-colors">Individual Therapy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Couple Therapy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Online Support</a></li>
                </ul>
              </div>
              <div className="space-y-4 hidden lg:block">
                <h5 className="font-black uppercase tracking-widest text-[10px] text-primary">Connect</h5>
                <ul className="space-y-2 text-foreground/60">
                  <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] text-foreground/30 font-bold uppercase tracking-widest">
              © 2026 Calmscious. All Rights Reserved.
            </p>
            <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-foreground/30">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
