/*
# Add fee_group column to fee_setup

1. Changes
- Adds `fee_group` (text, nullable) column to `fee_setup`.
- Fee setup rows now store a fee group label (e.g. "Nursery to UKG",
  "Class 11 to Class 12 (Science)") instead of individual class names.
  When `fee_group` is set, `class` and `stream` are null — the group
  label carries all the information needed.
- Replaces the existing unique constraint with one on
  (fee_group, fee_category, unit_number) so each group+category+unit
  combination has exactly one row.
2. Security
- No RLS or policy changes.
3. Notes
- The `class`, `stream`, and `subject_group` columns remain for backward
  compatibility — old rows keyed by class still work via the fallback
  in feeCalc.ts. New rows use `fee_group`.
- `fee_group` is nullable so old rows are not broken on column add.
*/

ALTER TABLE fee_setup ADD COLUMN IF NOT EXISTS fee_group text;

-- Replace unique constraint: drop old, add new including fee_group
ALTER TABLE fee_setup DROP CONSTRAINT IF EXISTS fee_setup_unique;
ALTER TABLE fee_setup ADD CONSTRAINT fee_setup_unique
  UNIQUE (fee_group, fee_category, unit_number);
