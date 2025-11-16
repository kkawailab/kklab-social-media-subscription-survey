/*
  # Add visibility control to surveys

  1. Changes
    - Add `is_visible` column to surveys table
    - Set default value to true for backward compatibility
    - Update existing surveys to be visible by default
  
  2. Details
    - `is_visible` (boolean): Controls whether survey appears in public survey list
    - Independent from `is_active`: A survey can be inactive but visible, or active but hidden
    - Default: true (visible to users)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'surveys' AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE surveys ADD COLUMN is_visible boolean DEFAULT true;
  END IF;
END $$;

-- Ensure all existing surveys are visible by default
UPDATE surveys SET is_visible = true WHERE is_visible IS NULL;
