/*
# SYNCD School Management - Database Schema

Creates the full schema for the SYNCD school management app:
- students: student records with class, section, stream, guardian info, fee category, 2nd-ward discount
- fee_setup: per-unit fee config by class/stream/category (amount + fine left blank for admin to fill)
- fee_payments: per-student per-unit payment tracking (paid/pending/partial)
- attendance: daily attendance records (present/absent/leave)

Security: RLS enabled on all tables, scoped to authenticated users (the app has a sign-in screen).
*/

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number text UNIQUE NOT NULL,
  name text NOT NULL,
  class text NOT NULL,
  section text NOT NULL,
  stream text,
  fathers_name text,
  mothers_name text,
  phone_number text,
  email text,
  fee_category text NOT NULL DEFAULT 'CIVILLIAN',
  second_ward_discount boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_students" ON students;
CREATE POLICY "select_own_students" ON students FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_students" ON students;
CREATE POLICY "insert_own_students" ON students FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_students" ON students;
CREATE POLICY "update_own_students" ON students FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_students" ON students;
CREATE POLICY "delete_own_students" ON students FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- FEE SETUP (per class/stream/category/unit)
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_setup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class text NOT NULL,
  stream text,
  fee_category text NOT NULL DEFAULT 'CIVILLIAN',
  unit_number integer NOT NULL,
  amount numeric,
  fine_amount numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE (class, stream, fee_category, unit_number)
);

ALTER TABLE fee_setup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fee_setup" ON fee_setup;
CREATE POLICY "select_fee_setup" ON fee_setup FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_fee_setup" ON fee_setup;
CREATE POLICY "insert_fee_setup" ON fee_setup FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fee_setup" ON fee_setup;
CREATE POLICY "update_fee_setup" ON fee_setup FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fee_setup" ON fee_setup;
CREATE POLICY "delete_fee_setup" ON fee_setup FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- FEE PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  unit_number integer NOT NULL,
  year integer NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  fine_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_date date,
  due_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fee_payments" ON fee_payments;
CREATE POLICY "select_fee_payments" ON fee_payments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_fee_payments" ON fee_payments;
CREATE POLICY "insert_fee_payments" ON fee_payments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fee_payments" ON fee_payments;
CREATE POLICY "update_fee_payments" ON fee_payments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fee_payments" ON fee_payments;
CREATE POLICY "delete_fee_payments" ON fee_payments FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_attendance" ON attendance;
CREATE POLICY "select_attendance" ON attendance FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_attendance" ON attendance;
CREATE POLICY "insert_attendance" ON attendance FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_attendance" ON attendance;
CREATE POLICY "update_attendance" ON attendance FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_attendance" ON attendance;
CREATE POLICY "delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_admission ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
