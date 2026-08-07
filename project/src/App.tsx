import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Landing from '@/components/Landing';
import AuthForm from '@/components/AuthForm';
import Layout, { type Page } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Attendance from '@/pages/Attendance';
import Students from '@/pages/Students';
import Fees from '@/pages/Fees';
import Reports from '@/pages/Reports';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import { Loader2, GraduationCap } from 'lucide-react';

type View = 'landing' | 'login' | 'signup' | 'app';

function Shell() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [page, setPage] = useState<Page>('dashboard');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center animate-pulse">
          <GraduationCap className="text-white" size={28} />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading SYNCD…
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <Layout current={page} onNavigate={setPage} search={search} onSearch={setSearch}>
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'attendance' && <Attendance search={search} />}
        {page === 'students' && <Students search={search} />}
        {page === 'fees' && <Fees search={search} />}
        {page === 'reports' && <Reports search={search} />}
        {page === 'analytics' && <Analytics />}
        {page === 'settings' && <Settings />}
      </Layout>
    );
  }

  if (view === 'login' || view === 'signup') {
    return <AuthForm mode={view} onSwitch={() => setView(v => v === 'login' ? 'signup' : 'login')} onBack={() => setView('landing')} />;
  }

  return <Landing onGetStarted={() => setView('signup')} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}
