import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — set these in your Vercel project settings under Environment Variables.');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type FeeCategory = 'CIVILIAN' | 'PAC_POLICE' | '4TH_CLASS';
export type AttendanceStatus = 'present' | 'absent' | 'leave';
export type FeeStatus = 'paid' | 'unpaid' | 'pending' | 'partial' | 'completed';

export interface Student {
  id: string;
  admission_number: string;
  name: string;
  class: string;
  section: string;
  father_name: string | null;
  mother_name: string | null;
  phone: string | null;
  email: string | null;
  fee_category: FeeCategory;
  sibling_discount: boolean;
  created_at?: string;
  user_id?: string;
}

export interface AttendanceRow {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  user_id?: string;
}

export interface FeeConfig {
  id: string;
  year: number;
  unit_number: 1 | 2 | 3 | 4;
  fee_category: FeeCategory;
  amount: number;
  fine_amount: number;
  pay_without_fine_date: string | null;
  months: string | null;
  user_id?: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  year: number;
  unit_number: 1 | 2 | 3 | 4;
  fee_category: FeeCategory | null;
  amount_paid: number;
  fine_paid: number;
  discount: number;
  status: FeeStatus;
  payment_date: string | null;
  user_id?: string;
}

export const CLASSES = [
  'Pre-Nursery','Nursery','LKG','UKG',
  'Class 1','Class 2','Class 3','Class 4','Class 5','Class 6',
  'Class 7','Class 8','Class 9','Class 10','Class 11','Class 12',
];
export const SECTIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const FEE_CATEGORIES: FeeCategory[] = ['CIVILIAN','PAC_POLICE','4TH_CLASS'];
export const UNITS = [1,2,3,4] as const;
export const UNIT_INFO: Record<number, { label: string; months: string; window: string }> = {
  1: { label: 'Unit 1', months: 'April - June', window: '1 April - 10 May' },
  2: { label: 'Unit 2', months: 'July - September', window: '1 July - 10 August' },
  3: { label: 'Unit 3', months: 'October - December', window: '1 October - 10 November' },
  4: { label: 'Unit 4', months: 'January - March', window: '1 January - 10 February' },
};
