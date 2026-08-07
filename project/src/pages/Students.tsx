import { useEffect, useMemo, useState } from 'react';
import { supabase, CLASSES, SECTIONS, FEE_CATEGORIES, type Student, type FeeCategory } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Search, Plus, Trash2, Eye, X, User, Mail, Phone, GraduationCap, Users as UsersIcon, Loader2, AlertTriangle, Pencil } from 'lucide-react';
import { attColor, pct } from '@/lib/ui';

export default function Students({ search }: { search: string }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [att, setAtt] = useState<{ student_id: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [confirmDel, setConfirmDel] = useState<Student | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const q = (search || localSearch).toLowerCase();

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: a }] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('attendance').select('student_id,status'),
    ]);
    setStudents(s ?? []);
    setAtt(a ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const attPctFor = (id: string) => {
    const rows = att.filter(a => a.student_id === id);
    return pct(rows.filter(a => a.status === 'present').length, rows.length);
  };

  const filtered = useMemo(() => students.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q) ||
    (s.email ?? '').toLowerCase().includes(q) || (s.phone ?? '').toLowerCase().includes(q)
  ), [students, q]);

  const deleteStudent = async () => {
    if (!confirmDel) return;
    const { error } = await supabase.from('students').delete().eq('id', confirmDel.id);
    setConfirmDel(null);
    if (error) {
      setToast('Failed to delete student');
    } else {
      setToast('Student deleted permanently');
    }
    setTimeout(() => setToast(null), 2500);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{students.length} enrolled · {filtered.length} shown</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-brand-600/30">
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={localSearch} onChange={e => setLocalSearch(e.target.value)}
          placeholder="Search by name, roll no, email, phone"
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
              <tr className="text-left text-slate-500 dark:text-slate-300">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Roll No</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium">Att %</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(s => {
                const ap = attPctFor(s.id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
                          {s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.admission_number}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.class} {s.section}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell">{s.email ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell">{s.phone ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ap>=75?attColor.present:ap>=50?'bg-amber-100 text-amber-700':'bg-rose-100 text-rose-700'}`}>{ap}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{s.fee_category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setViewing(s)} className="p-1.5 rounded-md hover:bg-brand-100 dark:hover:bg-brand-900/40 text-brand-600 transition" title="View"><Eye size={16} /></button>
                        <button onClick={() => setEditing(s)} className="p-1.5 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-600 transition" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => setConfirmDel(s)} className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 transition" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No students found. Click "Add Student" to create one.</td></tr>
              )}
              {loading && Array.from({length:5}).map((_,i)=>(
                <tr key={i}>{Array.from({length:8}).map((__,j)=><td key={j} className="px-4 py-3"><div className="h-5 skeleton" /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <StudentFormModal mode="add" onClose={() => { setShowAdd(false); load(); }} onToast={t => { setToast(t); setTimeout(()=>setToast(null),2500); }} />}
      {editing && <StudentFormModal mode="edit" student={editing} onClose={() => { setEditing(null); load(); }} onToast={t => { setToast(t); setTimeout(()=>setToast(null),2500); }} />}
      {viewing && <ProfileModal student={viewing} attPct={attPctFor(viewing.id)} attRows={att.filter(a=>a.student_id===viewing.id)} onClose={() => setViewing(null)} onEdit={() => { setEditing(viewing); setViewing(null); }} />}
      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDel(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center"><AlertTriangle className="text-rose-600" size={20} /></div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Delete permanently?</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">This will permanently remove {confirmDel.name} and all related attendance and fee records. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={deleteStudent} className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-slate-900 text-white text-sm shadow-xl animate-fade">{toast}</div>
      )}
      <p className="text-xs text-slate-400 text-center">Signed in as {user?.email}</p>
    </div>
  );
}

type FormMode = 'add' | 'edit';

function StudentFormModal({ mode, student, onClose, onToast }: {
  mode: FormMode;
  student?: Student;
  onClose: () => void;
  onToast: (t: string) => void;
}) {
  const [form, setForm] = useState({
    name: student?.name ?? '',
    admission_number: student?.admission_number ?? '',
    class: student?.class ?? CLASSES[0],
    section: student?.section ?? 'A',
    father_name: student?.father_name ?? '',
    mother_name: student?.mother_name ?? '',
    phone: student?.phone ?? '',
    email: student?.email ?? '',
    fee_category: student?.fee_category ?? ('CIVILIAN' as FeeCategory),
    sibling_discount: student?.sibling_discount ?? false,
  });

  // Auto-suggest next admission number for new students
  useEffect(() => {
    if (mode !== 'add' || form.admission_number) return;
    (async () => {
      const { data } = await supabase.from('students').select('admission_number').order('admission_number', { ascending: false }).limit(1);
      const last = data?.[0]?.admission_number;
      const next = last ? (parseInt(last, 10) + 1).toString() : '1001';
      setForm(f => ({ ...f, admission_number: isNaN(Number(next)) ? '' : next }));
    })();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.admission_number) { setError('Name and admission number are required'); return; }
    setBusy(true); setError(null);
    let result;
    if (mode === 'edit' && student) {
      result = await supabase.from('students').update(form).eq('id', student.id);
    } else {
      result = await supabase.from('students').insert(form);
    }
    setBusy(false);
    if (result.error) {
      if (result.error.code === '23505') {
        setError('A student with this admission number already exists. Please use a different number.');
      } else {
        setError(result.error.message);
      }
      return;
    }
    onToast(mode === 'edit' ? 'Student updated' : 'Student added');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between mb-4 p-6 pb-3 bg-white dark:bg-slate-800 rounded-t-2xl">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{mode === 'edit' ? 'Edit Student' : 'Add New Student'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="px-6 pb-6">
        {error && <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 text-sm">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Field label="Full Name *"><input value={form.name} onChange={e=>set('name',e.target.value)} className={inp} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Admission No *"><input value={form.admission_number} onChange={e=>set('admission_number',e.target.value)} className={inp} required /></Field>
            <Field label="Class">
              <select value={form.class} onChange={e=>set('class',e.target.value)} className={inp}>
                {CLASSES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Section">
              <select value={form.section} onChange={e=>set('section',e.target.value)} className={inp}>
                {SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Fee Category">
              <select value={form.fee_category} onChange={e=>set('fee_category',e.target.value)} className={inp}>
                {FEE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Father's Name"><input value={form.father_name} onChange={e=>set('father_name',e.target.value)} className={inp} /></Field>
            <Field label="Mother's Name"><input value={form.mother_name} onChange={e=>set('mother_name',e.target.value)} className={inp} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input value={form.phone} onChange={e=>set('phone',e.target.value)} className={inp} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className={inp} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={form.sibling_discount} onChange={e=>set('sibling_discount',e.target.checked)} className="rounded" />
            Apply 2nd ward sibling discount
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 size={16} className="animate-spin" />} {mode === 'edit' ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ student: s, attPct, attRows, onClose, onEdit }: { student: Student; attPct: number; attRows: { student_id: string; status: string }[]; onClose: () => void; onEdit: () => void }) {
  const present = attRows.filter(a=>a.status==='present').length;
  const absent = attRows.filter(a=>a.status==='absent').length;
  const leave = attRows.filter(a=>a.status==='leave').length;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between mb-5 p-6 pb-3 bg-white dark:bg-slate-800 rounded-t-2xl">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Student Profile</h3>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-200 transition flex items-center gap-1.5"><Pencil size={14} /> Edit</button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
        </div>
        <div className="px-6 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
            {s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Admission: {s.admission_number}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info icon={GraduationCap} label="Class" value={`${s.class} - ${s.section}`} />
          <Info icon={UsersIcon} label="Category" value={s.fee_category} />
          <Info icon={User} label="Father" value={s.father_name ?? '-'} />
          <Info icon={User} label="Mother" value={s.mother_name ?? '-'} />
          <Info icon={Phone} label="Phone" value={s.phone ?? '-'} />
          <Info icon={Mail} label="Email" value={s.email ?? '-'} />
          <Info icon={User} label="Sibling Discount" value={s.sibling_discount ? 'Yes (2nd ward)' : 'No'} />
          <Info icon={GraduationCap} label="Attendance" value={`${attPct}%`} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-900/30 text-center">
            <div className="text-2xl font-bold text-emerald-600">{present}</div><div className="text-xs text-emerald-700 dark:text-emerald-300">Present</div>
          </div>
          <div className="rounded-lg p-3 bg-rose-50 dark:bg-rose-900/30 text-center">
            <div className="text-2xl font-bold text-rose-600">{absent}</div><div className="text-xs text-rose-700 dark:text-rose-300">Absent</div>
          </div>
          <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-900/30 text-center">
            <div className="text-2xl font-bold text-amber-600">{leave}</div><div className="text-xs text-amber-700 dark:text-amber-300">Leave</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

const inp = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>{children}</div>;
}
function Info({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
      <Icon size={16} className="text-slate-400 mt-0.5" />
      <div><div className="text-xs text-slate-400">{label}</div><div className="font-medium text-slate-900 dark:text-white">{value}</div></div>
    </div>
  );
}
