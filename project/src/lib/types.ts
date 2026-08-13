export interface Student {
  id: string;
  admission_number: string;
  name: string;
  class: string;
  section: string;
  stream: string | null;
  subject_group: string | null;
  fathers_name: string | null;
  mothers_name: string | null;
  phone_number: string | null;
  email: string | null;
  fee_category: string;
  second_ward_discount: boolean;
  created_at: string;
}

export interface FeeSetup {
  id: string;
  class: string;
  stream: string | null;
  subject_group: string | null;
  fee_category: string;
  unit_number: number;
  amount: number | null;
  second_ward_amount: number | null;
  fine_amount: number | null;
  due_date: string | null;
  created_at: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  unit_number: number;
  year: number;
  amount_paid: number;
  total_amount: number;
  fine_paid: number;
  status: string;
  payment_date: string | null;
  due_date: string | null;
  subject_group: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  created_at: string;
}

export interface StudentWithDetails extends Student {
  attendance_percentage?: number;
  fee_status?: string;
  fee_summary?: {
    total: number;
    paid: number;
    pending: number;
  };
}
