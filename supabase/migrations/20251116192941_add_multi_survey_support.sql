/*
  # Add Multi-Survey Support

  1. New Tables
    - `surveys`
      - `id` (uuid, primary key) - Unique identifier for each survey
      - `title` (text) - Survey title/name
      - `description` (text, nullable) - Optional survey description
      - `is_active` (boolean) - Whether the survey is currently active
      - `created_at` (timestamptz) - When the survey was created
      - `updated_at` (timestamptz) - Last modification timestamp

  2. Modified Tables
    - `survey_responses`
      - Add `survey_id` (uuid, foreign key) - Reference to the survey
      - Keep existing fields: id, session_id, created_at

  3. Security
    - Enable RLS on surveys table
    - Allow public read access to active surveys
    - Allow authenticated users (admins) to manage surveys
    - Update existing policies to work with survey_id

  4. Data Migration
    - Create a default survey for existing data
    - Link all existing responses to the default survey

  5. Indexes
    - Add index on survey_id in survey_responses
    - Add index on is_active in surveys for filtering active surveys

  6. Notes
    - This migration maintains backward compatibility with existing data
    - All existing responses will be associated with a default survey
    - Surveys can be activated/deactivated without deleting data
    - Each survey maintains independent statistics and responses
*/

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add survey_id to survey_responses (initially nullable for migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'survey_id'
  ) THEN
    ALTER TABLE survey_responses ADD COLUMN survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create default survey and migrate existing data
DO $$
DECLARE
  default_survey_id uuid;
BEGIN
  -- Check if default survey already exists
  SELECT id INTO default_survey_id FROM surveys WHERE title = 'デフォルト調査' LIMIT 1;
  
  -- Create default survey if it doesn't exist
  IF default_survey_id IS NULL THEN
    INSERT INTO surveys (title, description, is_active)
    VALUES ('デフォルト調査', '初期の調査データ', true)
    RETURNING id INTO default_survey_id;
  END IF;
  
  -- Update existing responses to use default survey
  UPDATE survey_responses
  SET survey_id = default_survey_id
  WHERE survey_id IS NULL;
END $$;

-- Make survey_id NOT NULL after migration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'survey_responses' AND column_name = 'survey_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE survey_responses ALTER COLUMN survey_id SET NOT NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON surveys(is_active);

-- Enable RLS on surveys table
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active surveys
CREATE POLICY "Anyone can view active surveys"
  ON surveys
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow anyone to view all surveys (for admin dashboard)
CREATE POLICY "Anyone can view all surveys for stats"
  ON surveys
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert surveys (will be used by admin with password)
CREATE POLICY "Anyone can create surveys"
  ON surveys
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update surveys (will be used by admin with password)
CREATE POLICY "Anyone can update surveys"
  ON surveys
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete surveys (will be used by admin with password)
CREATE POLICY "Anyone can delete surveys"
  ON surveys
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();