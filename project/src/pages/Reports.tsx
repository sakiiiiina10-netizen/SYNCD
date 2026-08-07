import { useEffect, useState } from 'react';
import { supabase, type Student, type AttendanceRow, type FeePayment, type AttendanceStatus } from '@/lib/supabase';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import { attColor, pct, feeStatusColor } from '@/lib/ui';
import { CalendarCheck, Users, Wallet, FileText } from 'lucide-react';

type Tab = 'attendance' | 'student' | 'fees';

export default function Reports({ search }: { search: string }) {
  const [tab, setTab] = useState<Tab>('attendance');
  const [students, setStudents] = useState<Student[]>([]);
  const [att, setAtt] = useState<AttendanceRow[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: a }, { data: f }] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('attendance').select('*'),
        supabase.from('fee_payments').select('*'),
      ]);
      setStudents(s ?? []);
      setAtt(a ?? []);
      setPayments(f ?? []);
      setLoading(false);
    })();
  }, []);

  const q = search.toLowerCase();
  const filteredStudents = students.filter(s => !q || s.name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q) || (s.phone ?? '').toLowerCase().includes(q));

  const attPctFor = (id: string) => {
    const rows = att.filter(a => a.student_id === id);
    return pct(rows.filter(a => a.status === 'present').length, rows.length);
  };
  const statusFor = (id: string) => {
    const rows = att.filter(a => a.student_id === id);
    return { present: rows.filter(a=>a.status==='present').length, absent: rows.filter(a=>a.status==='absent').length, leave: rows.filter(a=>a.status==='leave').length };
  };

  const present = att.filter(a=>a.status==='present').length;
  const absent = att.filter(a=>a.status==='absent').length;
  const leave = att.filter(a=>a.status==='leave').length;
  const totalAtt = att.length;
  const overallPct = pct(present, totalAtt);

  const totalCollected = payments.reduce((s,p)=>s+Number(p.amount_paid)+Number(p.fine_paid),0);
  const paid = payments.filter(p=>p.status==='paid'||p.status==='completed').length;
  const unpaid = payments.filter(p=>p.status==='unpaid').length;
  const pending = payments.filter(p=>p.status==='pending').length;
  const partial = payments.filter(p=>p.status==='partial').length;

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'attendance', label: 'Attendance Report', icon: CalendarCheck },
    { id: 'student', label: 'Student Report', icon: Users },
    { id: 'fees', label: 'Fees Report', icon: Wallet },
  ];

  if (loading) return <div className="space-y-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-20 skeleton" />)}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Attendance, student and fee reports</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${tab===t.id?'bg-brand-600 text-white shadow-lg shadow-brand-600/30':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total Records" value={totalAtt} />
            <Stat label="Present" value={present} color="text-emerald-600" />
            <Stat label="Absent" value={absent} color="text-rose-600" />
            <Stat label="Attendance %" value={`${overallPct}%`} color="text-brand-600" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Attendance Distribution</h3>
              {totalAtt === 0 ? <Empty /> : <PieChart data={[
                { label: 'Present', value: present, color: '#10b981' },
                { label: 'Absent', value: absent, color: '#f43f5e' },
                { label: 'Leave', value: leave, color: '#f59e0b' },
              ]} />}
            </div>
            <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Per-Student Attendance %</h3>
              <BarChart data={filteredStudents.slice(0,12).map(s=>({ label: s.name.split(' ')[0], value: attPctFor(s.id) }))} max={100} />
            </div>
          </div>
          <ReportTable
            headers={['Student','Roll No','Class','Present','Absent','Leave','Att %']}
            rows={filteredStudents.map(s => { const st = statusFor(s.id); return [
              s.name, s.admission_number, `${s.class} ${s.section}`, st.present, st.absent, st.leave, `${attPctFor(s.id)}%`
            ]; })}
          />
        </div>
      )}

      {tab === 'student' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total Students" value={students.length} />
            <Stat label="Classes" value={new Set(students.map(s=>s.class)).size} />
            <Stat label="Categories" value={new Set(students.map(s=>s.fee_category)).size} />
            <Stat label="Sibling Discount" value={students.filter(s=>s.sibling_discount).length} />
          </div>
          <ReportTable
            headers={['Name','Roll No','Email','Phone','Class','Category','Att %']}
            rows={filteredStudents.map(s => [s.name, s.admission_number, s.email ?? '-', s.phone ?? '-', `${s.class} ${s.section}`, s.fee_category, `${attPctFor(s.id)}%`])}
          />
        </div>
      )}

      {tab === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total Collected" value={`₹${totalCollected.toLocaleString()}`} />
            <Stat label="Paid" value={paid} color="text-emerald-600" />
            <Stat label="Pending" value={pending} color="text-amber-600" />
            <Stat label="Unpaid" value={unpaid} color="text-rose-600" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Fees Statistics</h3>
              {payments.length === 0 ? <Empty /> : <PieChart data={[
                { label: 'Paid', value: paid, color: '#059669' },
                { label: 'Partial', value: partial, color: '#0ea5e9' },
                { label: 'Pending', value: pending, color: '#f59e0b' },
                { label: 'Unpaid', value: unpaid, color: '#f43f5e' },
              ]} />}
            </div>
            <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Collection by Unit</h3>
              <BarChart data={[1,2,3,4].map(u => ({ label: `U${u}`, value: payments.filter(p=>p.unit_number===u).reduce((s,p)=>s+Number(p.amount_paid),0) }))} />
            </div>
          </div>
          <ReportTable
            headers={['Student','Roll No','Unit','Amount Paid','Fine','Discount','Status']}
            rows={payments.map(p => {
              const s = students.find(x=>x.id===p.student_id);
              return [s?.name ?? '—', s?.admission_number ?? '—', `Unit ${p.unit_number}`, `₹${p.amount_paid}`, `₹${p.fine_paid}`, `₹${p.discount}`, p.status];
            })}
          />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}
function Empty() { return <p className="text-sm text-slate-400 py-8 text-center">No data available.</p>; }

function ReportTable({ headers, rows }: { headers: string[]; rows: (string|number)[][] }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto max-h-[55vh]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
            <tr className="text-left text-slate-500 dark:text-slate-300">
              {headers.map((h,i)=><th key={i} className="px-4 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((r,i)=>(
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                {r.map((c,j)=><td key={j} className="px-4 py-3 text-slate-700 dark:text-slate-200">{c}</td>)}
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400">No records.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
