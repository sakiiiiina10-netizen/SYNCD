-- Add second_ward_amount to fee_setup so admin can set a specific fee for 2nd ward students per unit
ALTER TABLE fee_setup ADD COLUMN IF NOT EXISTS second_ward_amount numeric;

-- Fix the CIVILLIAN spelling: update existing rows
UPDATE fee_setup SET fee_category = 'CIVILIAN' WHERE fee_category = 'CIVILLIAN';
UPDATE students SET fee_category = 'CIVILIAN' WHERE fee_category = 'CIVILLIAN';

-- Drop the unique constraint that includes subject_group (we're combining PCB/PCM into one Science)
ALTER TABLE fee_setup DROP CONSTRAINT IF EXISTS fee_setup_unique;
ALTER TABLE fee_setup ADD CONSTRAINT fee_setup_unique
  UNIQUE (class, stream, fee_category, unit_number);
