import { useEffect, useState } from 'react';
import { supabase, type Student, type AttendanceRow, type FeePayment, UNITS } from '@/lib/supabase';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import { pct } from '@/lib/ui';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';

export default function Analytics() {
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
      setStudents(s ?? []); setAtt(a ?? []); setPayments(f ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid lg:grid-cols-2 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-64 skeleton" />)}</div>;

  const present = att.filter(a=>a.status==='present').length;
  const absent = att.filter(a=>a.status==='absent').length;
  const leave = att.filter(a=>a.status==='leave').length;
  const attPct = pct(present, att.length);

  const paid = payments.filter(p=>p.status==='paid'||p.status==='completed').length;
  const unpaid = payments.filter(p=>p.status==='unpaid').length;
  const partial = payments.filter(p=>p.status==='partial').length;
  const pending = payments.filter(p=>p.status==='pending').length;

  // class distribution
  const classDist: Record<string, number> = {};
  students.forEach(s => { classDist[s.class] = (classDist[s.class] ?? 0) + 1; });
  const classBar = Object.entries(classDist).map(([label, value]) => ({ label, value }));

  // category distribution
  const catDist: Record<string, number> = {};
  students.forEach(s => { catDist[s.fee_category] = (catDist[s.fee_category] ?? 0) + 1; });

  // 30-day attendance trend
  const days: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const dayAtt = att.filter(a => a.date === ds);
    days.push({ label: d.toLocaleDateString('en', { day: 'numeric' }), value: pct(dayAtt.filter(a=>a.status==='present').length, dayAtt.length) });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Visual statistics and insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Activity} label="Attendance Rate" value={`${attPct}%`} color="bg-emerald-500" />
        <Kpi icon={TrendingUp} label="Total Students" value={students.length} color="bg-brand-600" />
        <Kpi icon={PieIcon} label="Fees Paid" value={paid} color="bg-emerald-700" />
        <Kpi icon={BarChart3} label="Fees Pending" value={pending + unpaid} color="bg-rose-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Attendance Analytics" subtitle="Present / Absent / Leave">
          {att.length === 0 ? <Empty /> : (
            <PieChart data={[
              { label: 'Present', value: present, color: '#10b981' },
              { label: 'Absent', value: absent, color: '#f43f5e' },
              { label: 'Leave', value: leave, color: '#f59e0b' },
            ]} />
          )}
        </Card>

        <Card title="Fee Analytics" subtitle="Paid (dark green) / Unpaid (light green)">
          {payments.length === 0 ? <Empty /> : (
            <PieChart data={[
              { label: 'Paid', value: paid, color: '#059669' },
              { label: 'Partial', value: partial, color: '#34d399' },
              { label: 'Pending', value: pending, color: '#f59e0b' },
              { label: 'Unpaid', value: unpaid, color: '#f43f5e' },
            ]} />
          )}
        </Card>

        <Card title="Students by Class" subtitle="Class distribution">
          {classBar.length === 0 ? <Empty /> : <BarChart data={classBar} />}
        </Card>

        <Card title="Students by Fee Category" subtitle="CIVILIAN / PAC / 4TH CLASS">
          {students.length === 0 ? <Empty /> : (
            <PieChart data={Object.entries(catDist).map(([label, value], i) => ({
              label, value, color: ['#6366f1','#0ea5e9','#f59e0b'][i % 3],
            }))} />
          )}
        </Card>

        <Card title="30-Day Attendance Trend" subtitle="Daily attendance %" full>
          <LineChart labels={days.map(d=>d.label)} series={[{ label: 'Attendance %', color: '#6366f1', points: days.map(d=>d.value) }]} height={220} />
        </Card>

        <Card title="Fee Collection by Unit" subtitle="Unit-wise collected amount" full>
          <BarChart data={UNITS.map(u => ({ label: `Unit ${u}`, value: payments.filter(p=>p.unit_number===u).reduce((s,p)=>s+Number(p.amount_paid),0) }))} />
        </Card>
      </div>

      <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Report Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
            <div className="text-xs text-emerald-700 dark:text-emerald-300">Attendance</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{attPct}%</div>
            <div className="text-xs mt-1 text-emerald-600/70">Present: {present} / {att.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-900/30">
            <div className="text-xs text-brand-700 dark:text-brand-300">Students</div>
            <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">{students.length}</div>
            <div className="text-xs mt-1 text-brand-600/70">{Object.keys(classDist).length} classes</div>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30">
            <div className="text-xs text-amber-700 dark:text-amber-300">Fees Collected</div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">₹{payments.reduce((s,p)=>s+Number(p.amount_paid)+Number(p.fine_paid),0).toLocaleString()}</div>
            <div className="text-xs mt-1 text-amber-600/70">{paid} paid · {pending + unpaid + partial} due</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${color} shadow-lg`}>
      <Icon size={22} className="opacity-80 mb-2" />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-white/80 text-sm mt-0.5">{label}</div>
    </div>
  );
}
function Card({ title, subtitle, children, full }: { title: string; subtitle?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${full ? 'lg:col-span-2' : ''}`}>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Empty() { return <p className="text-sm text-slate-400 py-8 text-center">No data available.</p>; }
