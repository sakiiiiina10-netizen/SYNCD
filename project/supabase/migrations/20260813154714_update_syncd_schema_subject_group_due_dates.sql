/*
# Update schema: subject_group (PCB/PCM) and configurable due dates
*/

-- Add subject_group to students (PCB/PCM for Science stream)
ALTER TABLE students ADD COLUMN IF NOT EXISTS subject_group text;

-- Add subject_group to fee_setup
ALTER TABLE fee_setup ADD COLUMN IF NOT EXISTS subject_group text;

-- Add due_date to fee_setup (so admin can set custom due dates per unit)
ALTER TABLE fee_setup ADD COLUMN IF NOT EXISTS due_date date;

-- Drop old unique constraint and add new one with subject_group
ALTER TABLE fee_setup DROP CONSTRAINT IF EXISTS fee_setup_class_stream_fee_category_unit_number_key;
ALTER TABLE fee_setup ADD CONSTRAINT fee_setup_unique
  UNIQUE (class, stream, subject_group, fee_category, unit_number);

-- Update fee_payments: add subject_group for record keeping
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS subject_group text;
