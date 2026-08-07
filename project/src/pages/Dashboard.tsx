import { useEffect, useState } from 'react';
import { supabase, type Student, type AttendanceRow, type FeePayment } from '@/lib/supabase';
import { Users, CalendarCheck, CalendarX, Wallet, TrendingUp, ArrowRight, BookOpen, BarChart3 } from 'lucide-react';
import PieChart from '@/components/PieChart';
import LineChart from '@/components/LineChart';
import type { Page } from '@/components/Layout';
import { attColor, pct } from '@/lib/ui';

interface Props { onNavigate: (p: Page) => void; }

export default function Dashboard({ onNavigate }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [att, setAtt] = useState<AttendanceRow[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: a }, { data: f }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('fee_payments').select('*'),
      ]);
      setStudents(s ?? []);
      setAtt(a ?? []);
      setPayments(f ?? []);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayAtt = att.filter(a => a.date === today);
  const present = todayAtt.filter(a => a.status === 'present').length;
  const absent = todayAtt.filter(a => a.status === 'absent').length;
  const onLeave = todayAtt.filter(a => a.status === 'leave').length;
  const attPct = pct(present, todayAtt.length);

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount_paid) + Number(p.fine_paid), 0);
  const completed = payments.filter(p => p.status === 'paid' || p.status === 'completed').length;
  const pending = payments.filter(p => p.status === 'pending' || p.status === 'partial' || p.status === 'unpaid').length;

  // last 7 days attendance trend
  const days: { label: string; present: number; absent: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const dayAtt = att.filter(a => a.date === ds);
    days.push({
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      present: dayAtt.filter(a => a.status === 'present').length,
      absent: dayAtt.filter(a => a.status === 'absent').length,
    });
  }

  const cards = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'from-brand-500 to-brand-700' },
    { label: 'Present Today', value: present, icon: CalendarCheck, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Absent Today', value: absent, icon: CalendarX, color: 'from-rose-500 to-rose-700' },
    { label: 'On Leave', value: onLeave, icon: CalendarX, color: 'from-amber-500 to-amber-700' },
  ];

  const quick: { label: string; page: Page; icon: typeof Users; desc: string }[] = [
    { label: 'Mark Attendance', page: 'attendance', icon: CalendarCheck, desc: 'Take today\'s attendance' },
    { label: 'Add Student', page: 'students', icon: Users, desc: 'Enroll a new student' },
    { label: 'Collect Fees', page: 'fees', icon: Wallet, desc: 'Record fee payments' },
    { label: 'View Reports', page: 'reports', icon: BarChart3, desc: 'Generate reports' },
  ];

  if (loading) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-28 skeleton" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's what's happening at your school today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${c.color} shadow-lg`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">{c.label}</p>
                <p className="text-3xl font-bold mt-1">{c.value}</p>
              </div>
              <c.icon size={24} className="opacity-80" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Attendance Today</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{attPct}%</p>
          <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${attPct}%` }} />
          </div>
        </div>
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Fees Collected</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">₹{totalCollected.toLocaleString()}</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-emerald-600">{completed} paid</span>
            <span className="text-amber-600">{pending} pending</span>
          </div>
        </div>
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">7-Day Attendance Trend</p>
          <LineChart
            labels={days.map(d => d.label)}
            series={[
              { label: 'Present', color: '#10b981', points: days.map(d => d.present) },
              { label: 'Absent', color: '#f43f5e', points: days.map(d => d.absent) },
            ]}
            height={180}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pie */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Today's Attendance</h3>
          {todayAtt.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No attendance marked today.</p>
          ) : (
            <PieChart data={[
              { label: 'Present', value: present, color: '#10b981' },
              { label: 'Absent', value: absent, color: '#f43f5e' },
              { label: 'Leave', value: onLeave, color: '#f59e0b' },
            ]} />
          )}
        </div>

        {/* Fee pie */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Fees Collection Summary</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No fee records yet.</p>
          ) : (
            <PieChart data={[
              { label: 'Paid', value: completed, color: '#059669' },
              { label: 'Pending', value: payments.filter(p=>p.status==='pending').length, color: '#f59e0b' },
              { label: 'Partial', value: payments.filter(p=>p.status==='partial').length, color: '#0ea5e9' },
              { label: 'Unpaid', value: payments.filter(p=>p.status==='unpaid').length, color: '#f43f5e' },
            ]} />
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Students</h3>
          <div className="space-y-2">
            {students.slice(-5).reverse().map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
                  {s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.class} · {s.admission_number}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${attColor.present}`}>Active</span>
              </div>
            ))}
            {students.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">No students yet.</p>}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quick.map((q, i) => (
            <button
              key={i}
              onClick={() => onNavigate(q.page)}
              className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center group-hover:bg-brand-600 transition">
                <q.icon className="text-brand-600 dark:text-brand-300 group-hover:text-white transition" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{q.label}</p>
                <p className="text-xs text-slate-400 truncate">{q.desc}</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-600 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
