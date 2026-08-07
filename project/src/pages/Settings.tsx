import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, User, Mail, Save, Check, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Theme */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {theme === 'light' ? <Sun className="text-amber-500" size={20} /> : <Moon className="text-brand-400" size={20} />}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark theme</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className={`relative w-14 h-7 rounded-full transition ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-7' : ''}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-semibold">
              {(user?.email ?? 'A')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Profile</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your account information</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={user?.email ?? ''} disabled className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value="Administrator" disabled className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300 outline-none" />
              </div>
            </div>
          </div>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center gap-2 transition">
            {saved ? <Check size={16} /> : <Save size={16} />} {saved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Danger */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Session</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Sign out of your SYNCD account.</p>
        <button onClick={signOut} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 transition">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
