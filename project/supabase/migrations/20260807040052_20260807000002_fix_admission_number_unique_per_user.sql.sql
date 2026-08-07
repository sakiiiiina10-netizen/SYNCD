-- Make admission_number unique per user instead of globally unique
-- This prevents 409 conflicts when different accounts use the same admission number
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_admission_number_key;
CREATE UNIQUE INDEX students_user_id_admission_number_key
  ON students (user_id, admission_number);
