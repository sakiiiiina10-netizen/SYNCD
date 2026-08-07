import type { AttendanceStatus, FeeStatus } from '@/lib/supabase';

export const attColor: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export const attDot: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500',
  absent: 'bg-rose-500',
  leave: 'bg-amber-500',
};

export const feeStatusColor: Record<FeeStatus, string> = {
  paid: 'bg-emerald-600 text-white',
  completed: 'bg-emerald-700 text-white',
  unpaid: 'bg-rose-500 text-white',
  pending: 'bg-amber-500 text-white',
  partial: 'bg-sky-500 text-white',
};

export function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

export function initials(name: string) {
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() || '?';
}
