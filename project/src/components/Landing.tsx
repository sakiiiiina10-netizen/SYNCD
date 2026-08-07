import { GraduationCap, Users, CalendarCheck, Wallet, BarChart3, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

interface Props { onGetStarted: () => void; }

export default function Landing({ onGetStarted }: Props) {

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/image%20copy.png" alt="Police Modern School emblem" className="w-10 h-10 object-contain shrink-0" />
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-white leading-tight">POLICE MODERN SCHOOL</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">Powered by SYNCD</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-brand-600 transition">Features</a>
            <a href="#modules" className="hover:text-brand-600 transition">Modules</a>
            <a href="#about" className="hover:text-brand-600 transition">About</a>
          </nav>
          <button onClick={onGetStarted} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition shadow-lg shadow-brand-600/30">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade">
            <div className="flex items-center gap-3 mb-6">
              <img src="/image%20copy.png" alt="Police Modern School emblem" className="w-14 h-14 object-contain" />
              <div>
                <div className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white">POLICE MODERN SCHOOL</div>
                <div className="inline-flex items-center gap-2 mt-1 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                  <ShieldCheck size={14} /> Complete School Management Platform
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Run your school <span className="text-brand-600">in sync</span>.
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-lg">
              SYNCD brings students, attendance, fees and reports into one elegant dashboard — built for principals, clerks and teachers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onGetStarted} className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition shadow-xl shadow-brand-600/30 flex items-center gap-2 group">
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </button>
              <a href="#features" className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-200 font-semibold transition">
                Explore Features
              </a>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div><div className="text-2xl font-bold text-slate-900 dark:text-white">16</div>Classes</div>
              <div><div className="text-2xl font-bold text-slate-900 dark:text-white">A-Z</div>Sections</div>
              <div><div className="text-2xl font-bold text-slate-900 dark:text-white">4</div>Fee Units</div>
            </div>
          </div>
          <div className="hidden md:block animate-fade">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-brand-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">SYNCD overview</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">School dashboard</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center"><GraduationCap className="text-white" size={21} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { icon: Users, label: 'Students', v: '1,240', color: 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300' },
                  { icon: CalendarCheck, label: 'Present', v: '92%', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' },
                  { icon: Wallet, label: 'Fees', v: '₹8.4L', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' },
                ].map((s,i)=>(
                  <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-700/60 p-3 border border-slate-100 dark:border-slate-600">
                    <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon size={16} /></div>
                    <div className="text-slate-900 dark:text-white font-bold text-lg">{s.v}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3"><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Attendance trend</span><span className="text-xs text-emerald-600 font-medium">+8.4%</span></div>
                <div className="flex items-end gap-2 h-28">
                  {[42,58,51,68,64,82,92].map((height, i) => <div key={i} className="flex-1 rounded-t-md bg-brand-500/80 hover:bg-brand-600 transition" style={{ height: `${height}%` }} />)}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Everything your school needs</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">From admissions to fee collection, SYNCD handles it all with a clean, fast interface.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Users, title: 'Student Records', desc: 'Add, view, search and permanently delete students with full profile details.' },
            { icon: CalendarCheck, title: 'Attendance', desc: 'Mark present, absent or leave. Track daily history and percentages.' },
            { icon: Wallet, title: 'Fee Collection', desc: '4 quarterly units, 3 fee categories, sibling discounts, fines and due dates.' },
            { icon: BarChart3, title: 'Reports & Analytics', desc: 'Attendance, student and fee reports with charts and statistics.' },
          ].map((f,i)=>(
            <div key={i} className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-xl transition bg-white dark:bg-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4 group-hover:bg-brand-600 transition">
                <f.icon className="text-brand-600 dark:text-brand-300 group-hover:text-white transition" size={22} />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="bg-slate-50 dark:bg-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Six integrated modules</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, name: 'Dashboard', desc: 'Statistics cards, charts and quick navigation.' },
              { icon: CalendarCheck, name: 'Attendance', desc: 'Daily marking, history and summary with charts.' },
              { icon: Users, name: 'Students', desc: 'Profiles, search and permanent deletion.' },
              { icon: Wallet, name: 'Fees', desc: 'Unit-wise collection with categories and discounts.' },
              { icon: BookOpen, name: 'Reports', desc: 'Attendance, student and fee reports.' },
              { icon: BarChart3, name: 'Analytics', desc: 'Visual statistics with pie and bar graphs.' },
            ].map((m,i)=>(
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="w-11 h-11 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                  <m.icon className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">{m.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to sync your school?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Create an account and start managing students, attendance and fees in minutes.</p>
        <button onClick={onGetStarted} className="px-8 py-3.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition shadow-xl shadow-brand-600/30 inline-flex items-center gap-2 group">
          Get Started Now <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
        </button>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        POLICE MODERN SCHOOL — Managed with SYNCD.
      </footer>
    </div>
  );
}
