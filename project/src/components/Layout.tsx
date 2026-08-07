import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { GraduationCap, LayoutDashboard, Users, CalendarCheck, Wallet, FileText, BarChart3, Settings, LogOut, Menu, X, Sun, Moon, Search } from 'lucide-react';

export type Page = 'dashboard' | 'attendance' | 'students' | 'fees' | 'reports' | 'analytics' | 'settings';

interface Props {
  current: Page;
  onNavigate: (p: Page) => void;
  search: string;
  onSearch: (s: string) => void;
  children: ReactNode;
}

const NAV: { id: Page; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'fees', label: 'Fees', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ current, onNavigate, search, onSearch, children }: Props) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const go = (p: Page) => { onNavigate(p); setOpen(false); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SYNCD</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(n => {
            const active = current === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <n.icon size={18} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 lg:px-6">
          <button onClick={() => setOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-300">
            <Menu size={22} />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search students, fees, reports..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-semibold">
                {(user?.email ?? 'A')[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full animate-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
