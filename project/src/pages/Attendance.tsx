import { useEffect, useMemo, useState } from 'react';
import { supabase, type Student, type AttendanceRow, type AttendanceStatus } from '@/lib/supabase';
import { Search, Save, Calendar, Loader2, Check, X, Clock } from 'lucide-react';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import { attColor, attDot, pct } from '@/lib/ui';

export default function Attendance({ search }: { search: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [existing, setExisting] = useState<AttendanceRow[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<AttendanceRow[]>([]);

  const q = (search || localSearch).toLowerCase();

  const load = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('students').select('*').order('name');
    setStudents(s ?? []);
    await loadDate();
    setLoading(false);
  };

  const loadDate = async () => {
    const { data: a } = await supabase.from('attendance').select('*').eq('date', date);
    setExisting(a ?? []);
    const map: Record<string, AttendanceStatus> = {};
    (a ?? []).forEach(r => { map[r.student_id] = r.status; });
    setRecords(map);
  };

  const loadHistory = async () => {
    const { data } = await supabase.from('attendance').select('*').order('date', { ascending: false }).limit(200);
    setHistory(data ?? []);
  };

  useEffect(() => { load(); loadHistory(); }, []);
  useEffect(() => { loadDate(); }, [date]);

  const filtered = useMemo(() => students.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q) ||
    (s.email ?? '').toLowerCase().includes(q) || (s.phone ?? '').toLowerCase().includes(q)
  ), [students, q]);

  const mark = (id: string, status: AttendanceStatus) => setRecords(r => ({ ...r, [id]: status }));

  const save = async () => {
    setSaving(true);
    const rows = Object.entries(records);
    for (const [studentId, status] of rows) {
      const ex = existing.find(e => e.student_id === studentId && e.date === date);
      if (ex) {
        await supabase.from('attendance').update({ status }).eq('id', ex.id);
      } else {
        await supabase.from('attendance').insert({ student_id: studentId, date, status });
      }
    }
    setSaving(false);
    setToast('Attendance saved');
    setTimeout(() => setToast(null), 2500);
    loadDate();
    loadHistory();
  };

  const counts = {
    present: Object.values(records).filter(s=>s==='present').length,
    absent: Object.values(records).filter(s=>s==='absent').length,
    leave: Object.values(records).filter(s=>s==='leave').length,
  };
  const ap = pct(counts.present, Object.values(records).length);

  // last 14 days summary
  const days: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const dayAtt = existing.filter(a => a.date === ds);
    // need full history for past days; approximate from history
    const histDay = history.filter(h => h.date === ds);
    days.push({
      label: d.toLocaleDateString('en', { day: 'numeric', month: 'short' }),
      value: pct(histDay.filter(h=>h.status==='present').length, histDay.length),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Mark and track daily attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present" value={counts.present} color="bg-emerald-500" />
        <StatCard label="Absent" value={counts.absent} color="bg-rose-500" />
        <StatCard label="On Leave" value={counts.leave} color="bg-amber-500" />
        <StatCard label="Rate" value={`${ap}%`} color="bg-brand-600" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={localSearch} onChange={e=>setLocalSearch(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[55vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
              <tr className="text-left text-slate-500 dark:text-slate-300">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Roll No</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(s => {
                const st = records[s.id];
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{s.admission_number}</td>
                    <td className="px-4 py-3 text-slate-500">{s.class} {s.section}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <StatusBtn active={st==='present'} color="emerald" icon={Check} onClick={()=>mark(s.id,'present')} />
                        <StatusBtn active={st==='absent'} color="rose" icon={X} onClick={()=>mark(s.id,'absent')} />
                        <StatusBtn active={st==='leave'} color="amber" icon={Clock} onClick={()=>mark(s.id,'leave')} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && !loading && <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No students.</td></tr>}
              {loading && Array.from({length:5}).map((_,i)=>(
                <tr key={i}>{Array.from({length:4}).map((__,j)=><td key={j} className="px-4 py-3"><div className="h-6 skeleton" /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-brand-600/30">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Attendance
      </button>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Today's Summary</h3>
          {Object.keys(records).length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No attendance marked yet.</p>
          ) : (
            <PieChart data={[
              { label: 'Present', value: counts.present, color: '#10b981' },
              { label: 'Absent', value: counts.absent, color: '#f43f5e' },
              { label: 'Leave', value: counts.leave, color: '#f59e0b' },
            ]} />
          )}
        </div>
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">14-Day Attendance Rate</h3>
          <BarChart data={days} max={100} />
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <h3 className="font-semibold text-slate-900 dark:text-white p-5 pb-3">Attendance History</h3>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
              <tr className="text-left text-slate-500 dark:text-slate-300">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Student</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {history.slice(0,80).map(h => {
                const st = students.find(s=>s.id===h.student_id);
                return (
                  <tr key={h.id}>
                    <td className="px-4 py-2 text-slate-500">{h.date}</td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-200">{st?.name ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${attColor[h.status as AttendanceStatus]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${attDot[h.status as AttendanceStatus]}`} />{h.status}</span>
                    </td>
                  </tr>
                );
              })}
              {history.length===0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No history yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm shadow-xl animate-fade">{toast}</div>}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <div className={`w-2.5 h-2.5 rounded-full bg-white`} />
      </div>
      <div><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div><div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div></div>
    </div>
  );
}

function StatusBtn({ active, color, icon: Icon, onClick }: { active: boolean; color: 'emerald'|'rose'|'amber'; icon: typeof Check; onClick: () => void }) {
  const map = {
    emerald: 'bg-emerald-600 text-white border-emerald-600',
    rose: 'bg-rose-600 text-white border-rose-600',
    amber: 'bg-amber-500 text-white border-amber-500',
  };
  return (
    <button onClick={onClick} className={`p-1.5 rounded-md border transition ${active ? map[color] : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:border-slate-300'}`}>
      <Icon size={14} />
    </button>
  );
}
