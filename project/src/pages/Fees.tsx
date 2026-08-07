import { useEffect, useMemo, useState } from 'react';
import { supabase, UNITS, UNIT_INFO, FEE_CATEGORIES, type Student, type FeeConfig, type FeePayment, type FeeCategory, type FeeStatus } from '@/lib/supabase';
import { Search, Wallet, Plus, X, Loader2, Check, IndianRupee, Settings as SettingsIcon } from 'lucide-react';
import PieChart from '@/components/PieChart';
import BarChart from '@/components/BarChart';
import { feeStatusColor } from '@/lib/ui';

export default function Fees({ search }: { search: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [config, setConfig] = useState<FeeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [unit, setUnit] = useState<number>(1);
  const [payModal, setPayModal] = useState<{ student: Student; payment: FeePayment | null } | null>(null);
  const [cfgModal, setCfgModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const q = (search || localSearch).toLowerCase();

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: p }, { data: c }] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('fee_payments').select('*'),
      supabase.from('fee_config').select('*'),
    ]);
    setStudents(s ?? []);
    setPayments(p ?? []);
    setConfig(c ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cfgFor = (cat: FeeCategory, u: number) => config.find(c => c.year === year && c.unit_number === u && c.fee_category === cat);

  const filtered = useMemo(() => students.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q) ||
    (s.email ?? '').toLowerCase().includes(q) || (s.phone ?? '').toLowerCase().includes(q)
  ), [students, q]);

  const payFor = (studentId: string, u: number) => payments.find(p => p.student_id === studentId && p.year === year && p.unit_number === u);

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount_paid) + Number(p.fine_paid), 0);
  const unitPayments = payments.filter(p => p.year === year && p.unit_number === unit);
  const unitCollected = unitPayments.reduce((s, p) => s + Number(p.amount_paid) + Number(p.fine_paid), 0);

  const statusCounts = {
    paid: unitPayments.filter(p=>p.status==='paid'||p.status==='completed').length,
    unpaid: unitPayments.filter(p=>p.status==='unpaid').length,
    pending: unitPayments.filter(p=>p.status==='pending').length,
    partial: unitPayments.filter(p=>p.status==='partial').length,
  };

  const unitBar = UNITS.map(u => ({
    label: `U${u}`,
    value: payments.filter(p=>p.year===year && p.unit_number===u).reduce((s,p)=>s+Number(p.amount_paid),0),
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fees</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Unit-wise fee collection</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setCfgModal(true)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
            <SettingsIcon size={16} /> Fee Setup
          </button>
        </div>
      </div>

      {/* Year + Unit selector */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 dark:text-slate-400">Year</label>
          <input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} className="w-24 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {UNITS.map(u => (
            <button key={u} onClick={()=>setUnit(u)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${unit===u?'bg-brand-600 text-white':'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
              {UNIT_INFO[u].label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
          <div>{UNIT_INFO[unit].months}</div>
          <div>Pay without fine: {UNIT_INFO[unit].window}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SumCard label="Total Collected" value={`₹${totalCollected.toLocaleString()}`} sub="all time" />
        <SumCard label={`Unit ${unit} Collected`} value={`₹${unitCollected.toLocaleString()}`} sub={`year ${year}`} />
        <SumCard label="Paid" value={statusCounts.paid} sub={`unit ${unit}`} color="text-emerald-600" />
        <SumCard label="Pending/Unpaid" value={statusCounts.pending + statusCounts.unpaid + statusCounts.partial} sub={`unit ${unit}`} color="text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Fee Status (Unit {unit})</h3>
          {unitPayments.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No payments recorded for this unit.</p>
          ) : (
            <PieChart data={[
              { label: 'Paid', value: statusCounts.paid, color: '#059669' },
              { label: 'Partial', value: statusCounts.partial, color: '#0ea5e9' },
              { label: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
              { label: 'Unpaid', value: statusCounts.unpaid, color: '#f43f5e' },
            ]} />
          )}
        </div>
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Collection by Unit (Year {year})</h3>
          <BarChart data={unitBar} />
        </div>
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
                <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(s => {
                const pay = payFor(s.id, unit);
                const cfg = cfgFor(s.fee_category, unit);
                const base = cfg ? Number(cfg.amount) : 0;
                const fine = cfg ? Number(cfg.fine_amount) : 0;
                const discount = pay ? Number(pay.discount) : (s.sibling_discount ? Math.round(base * 0.1) : 0);
                const net = base + fine - discount;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{s.admission_number}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">{s.fee_category}{s.sibling_discount && ' · 2nd ward'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">₹{net.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">₹{discount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(pay && feeStatusColor[pay.status]) || feeStatusColor.unpaid}`}>
                        {(pay && pay.status) || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={()=>setPayModal({ student: s, payment: pay ?? null })} className="px-3 py-1.5 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-200 transition">
                        {pay ? 'Edit' : 'Collect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && !loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No students found.</td></tr>}
              {loading && Array.from({length:5}).map((_,i)=>(
                <tr key={i}>{Array.from({length:7}).map((__,j)=><td key={j} className="px-4 py-3"><div className="h-6 skeleton" /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && <PayModal student={payModal.student} payment={payModal.payment} year={year} unit={unit} cfg={cfgFor(payModal.student.fee_category, unit)} onClose={() => { setPayModal(null); load(); }} onToast={t => { setToast(t); setTimeout(()=>setToast(null),2500); }} />}
      {cfgModal && <ConfigModal year={year} config={config} onClose={() => { setCfgModal(false); load(); }} />}
      {toast && <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm shadow-xl animate-fade">{toast}</div>}
    </div>
  );
}

function SumCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color?: string }) {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function PayModal({ student, payment, year, unit, cfg, onClose, onToast }: {
  student: Student; payment: FeePayment | null; year: number; unit: number; cfg: FeeConfig | undefined;
  onClose: () => void; onToast: (t: string) => void;
}) {
  const base = cfg ? Number(cfg.amount) : 0;
  const autoDiscount = student.sibling_discount ? Math.round(base * 0.1) : 0;
  const [amount, setAmount] = useState(payment ? Number(payment.amount_paid) : base);
  const [fine, setFine] = useState(payment ? Number(payment.fine_paid) : (cfg ? Number(cfg.fine_amount) : 0));
  const [discount, setDiscount] = useState(payment ? Number(payment.discount) : autoDiscount);
  const [status, setStatus] = useState<FeeStatus>(payment?.status ?? 'unpaid');
  const [payDate, setPayDate] = useState(payment?.payment_date ?? new Date().toISOString().slice(0,10));
  const [busy, setBusy] = useState(false);

  const net = base + fine - discount;
  const balance = net - amount;

  const save = async () => {
    setBusy(true);
    const payload = {
      student_id: student.id, year, unit_number: unit,
      fee_category: student.fee_category,
      amount_paid: amount, fine_paid: fine, discount,
      status, payment_date: payDate,
    };
    if (payment) {
      await supabase.from('fee_payments').update(payload).eq('id', payment.id);
    } else {
      await supabase.from('fee_payments').insert(payload);
    }
    setBusy(false);
    onToast('Payment saved');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Fee Payment</h3>
            <p className="text-sm text-slate-500">{student.name} · {UNIT_INFO[unit].label} · {year}</p>
          </div>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3 mb-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-medium text-slate-900 dark:text-white">{student.fee_category}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Base Amount</span><span className="font-medium text-slate-900 dark:text-white">₹{base.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Sibling Discount</span><span className="font-medium text-slate-900 dark:text-white">{student.sibling_discount ? '10% (2nd ward)' : 'No'}</span></div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount Paid (₹)</label>
            <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fine (₹)</label>
              <input type="number" value={fine} onChange={e=>setFine(Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Discount (₹)</label>
              <input type="number" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select value={status} onChange={e=>setStatus(e.target.value as FeeStatus)} className={inp}>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date of Pay</label>
              <input type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} className={inp} />
            </div>
          </div>
          <div className="rounded-lg bg-brand-50 dark:bg-brand-900/30 p-3 text-sm flex justify-between">
            <span className="text-brand-700 dark:text-brand-300">Balance Due</span>
            <span className="font-bold text-brand-700 dark:text-brand-300">₹{Math.max(0, balance).toLocaleString()}</span>
          </div>
          <button onClick={save} disabled={busy} className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Payment
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigModal({ year, config, onClose }: { year: number; config: FeeConfig[]; onClose: () => void }) {
  const [rows, setRows] = useState(() =>
    UNITS.flatMap(u => FEE_CATEGORIES.map(c => {
      const ex = config.find(x => x.year === year && x.unit_number === u && x.fee_category === c);
      return { unit: u, category: c, amount: ex?.amount ?? 0, fine: ex?.fine_amount ?? 0, window: ex?.pay_without_fine_date ?? '', months: ex?.months ?? UNIT_INFO[u].months };
    }))
  );
  const [busy, setBusy] = useState(false);

  const set = (i: number, k: 'amount'|'fine'|'window', v: string) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: k === 'window' ? v : Number(v) } : row));

  const save = async () => {
    setBusy(true);
    for (const r of rows) {
      const ex = config.find(x => x.year === year && x.unit_number === r.unit && x.fee_category === r.category);
      const payload = {
        year, unit_number: r.unit, fee_category: r.category,
        amount: r.amount, fine_amount: r.fine,
        pay_without_fine_date: r.window || null, months: r.months,
      };
      if (ex) await supabase.from('fee_config').update(payload).eq('id', ex.id);
      else await supabase.from('fee_config').insert(payload);
    }
    setBusy(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Fee Setup — {year}</h3>
            <p className="text-sm text-slate-500">Set amounts, fines and due dates per unit & category. Leave blank (0) if not set.</p>
          </div>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div className="col-span-3 text-xs">
                <div className="font-medium text-slate-900 dark:text-white">{UNIT_INFO[r.unit].label}</div>
                <div className="text-slate-400">{r.category}</div>
              </div>
              <div className="col-span-3">
                <label className="text-[10px] text-slate-400">Amount ₹</label>
                <input type="number" value={r.amount} onChange={e=>set(i,'amount',e.target.value)} className={inp} />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] text-slate-400">Fine ₹</label>
                <input type="number" value={r.fine} onChange={e=>set(i,'fine',e.target.value)} className={inp} />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] text-slate-400">Pay-by (no fine)</label>
                <input type="date" value={r.window} onChange={e=>set(i,'window',e.target.value)} className={inp} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} disabled={busy} className="w-full mt-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Fee Setup
        </button>
      </div>
    </div>
  );
}

const inp = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none';
