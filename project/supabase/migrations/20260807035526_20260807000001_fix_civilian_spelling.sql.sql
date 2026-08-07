-- Rename CIVILLIAN -> CIVILIAN across the schema
-- Must drop constraints FIRST, then update data, then re-add with correct spelling

-- 1. Drop old CHECK constraints (they only allow the misspelled value)
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_fee_category_check;
ALTER TABLE fee_config DROP CONSTRAINT IF EXISTS fee_config_fee_category_check;

-- 2. Update existing data
UPDATE students SET fee_category = 'CIVILIAN' WHERE fee_category = 'CIVILLIAN';
UPDATE fee_config SET fee_category = 'CIVILIAN' WHERE fee_category = 'CIVILLIAN';
UPDATE fee_payments SET fee_category = 'CIVILIAN' WHERE fee_category = 'CIVILLIAN';

-- 3. Recreate CHECK constraints with corrected spelling
ALTER TABLE students ADD CONSTRAINT students_fee_category_check
  CHECK (fee_category IN ('CIVILIAN','PAC_POLICE','4TH_CLASS'));
ALTER TABLE fee_config ADD CONSTRAINT fee_config_fee_category_check
  CHECK (fee_category IN ('CIVILIAN','PAC_POLICE','4TH_CLASS'));

-- 4. Update column default
ALTER TABLE students ALTER COLUMN fee_category SET DEFAULT 'CIVILIAN';
