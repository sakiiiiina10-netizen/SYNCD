import { useState, ReactNode } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { SCHOOL_NAME } from '@/lib/constants';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1">
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white lg:text-base">
              {SCHOOL_NAME}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </header>

        <main className="p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
