/*
# SYNCD School Management Schema

Shared admin app — any signed-in user manages all school data.

1. New Tables
- `students`: admission_number, name, class, section, father_name, mother_name, phone, email, fee_category (CIVILLIAN/PAC_POLICE/4TH_CLASS), sibling_discount flag.
- `attendance`: per-student daily status (present/absent/leave).
- `fee_config`: per year + unit (1-4) + fee_category amount, fine, pay-without-fine deadline, months label.
- `fee_payments`: per student + year + unit payment record with status and discount.

2. Fee units (academic year)
- Unit 1: April - June, pay-without-fine window 1 April - 10 May.
- Unit 2: July - September, 1 July - 10 August.
- Unit 3: October - December, 1 October - 10 November.
- Unit 4: January - March, 1 January - 10 February.
Amounts and fines are left blank (default 0) for the admin to fill in.

3. Security
- RLS enabled on all tables. All authenticated users share admin access (USING true, WITH CHECK true) documented as intentional shared admin data.
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number text UNIQUE NOT NULL,
  name text NOT NULL,
  class text NOT NULL,
  section text NOT NULL DEFAULT 'A',
  father_name text,
  mother_name text,
  phone text,
  email text,
  fee_category text NOT NULL DEFAULT 'CIVILLIAN' CHECK (fee_category IN ('CIVILLIAN','PAC_POLICE','4TH_CLASS')),
  sibling_discount boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_students" ON students;
CREATE POLICY "auth_select_students" ON students FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_students" ON students;
CREATE POLICY "auth_insert_students" ON students FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_students" ON students;
CREATE POLICY "auth_update_students" ON students FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_students" ON students;
CREATE POLICY "auth_delete_students" ON students FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present','absent','leave')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_attendance" ON attendance;
CREATE POLICY "auth_select_attendance" ON attendance FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_attendance" ON attendance;
CREATE POLICY "auth_insert_attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_attendance" ON attendance;
CREATE POLICY "auth_update_attendance" ON attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_attendance" ON attendance;
CREATE POLICY "auth_delete_attendance" ON attendance FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS fee_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int NOT NULL,
  unit_number int NOT NULL CHECK (unit_number IN (1,2,3,4)),
  fee_category text NOT NULL CHECK (fee_category IN ('CIVILLIAN','PAC_POLICE','4TH_CLASS')),
  amount numeric NOT NULL DEFAULT 0,
  fine_amount numeric NOT NULL DEFAULT 0,
  pay_without_fine_date date,
  months text,
  UNIQUE(year, unit_number, fee_category)
);

ALTER TABLE fee_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_fee_config" ON fee_config;
CREATE POLICY "auth_select_fee_config" ON fee_config FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_fee_config" ON fee_config;
CREATE POLICY "auth_insert_fee_config" ON fee_config FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_fee_config" ON fee_config;
CREATE POLICY "auth_update_fee_config" ON fee_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_fee_config" ON fee_config;
CREATE POLICY "auth_delete_fee_config" ON fee_config FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  year int NOT NULL,
  unit_number int NOT NULL CHECK (unit_number IN (1,2,3,4)),
  fee_category text,
  amount_paid numeric NOT NULL DEFAULT 0,
  fine_paid numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid','unpaid','pending','partial','completed')),
  payment_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, year, unit_number)
);

ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_fee_payments" ON fee_payments;
CREATE POLICY "auth_select_fee_payments" ON fee_payments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_fee_payments" ON fee_payments;
CREATE POLICY "auth_insert_fee_payments" ON fee_payments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_fee_payments" ON fee_payments;
CREATE POLICY "auth_update_fee_payments" ON fee_payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_fee_payments" ON fee_payments;
CREATE POLICY "auth_delete_fee_payments" ON fee_payments FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class_section ON students(class, section);
