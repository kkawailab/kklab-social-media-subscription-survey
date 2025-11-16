/*
  # Fix Security Issues

  1. Remove Unused Indexes
    - Drop `idx_survey_responses_session_id` - not used in queries
    - Drop `idx_social_media_selections_platform_name` - not used in queries
    - Drop `idx_surveys_is_active` - not used since we filter by both is_active and is_visible
    - Keep `idx_survey_responses_survey_id` and `idx_social_media_selections_response_id` as they are used

  2. Fix Multiple Permissive RLS Policies
    - Drop duplicate SELECT policies on surveys table
    - Create single consolidated SELECT policy that allows viewing all surveys
    - This is necessary for admin dashboard to view all surveys and for public to view active+visible surveys

  3. Fix Function Search Path
    - Recreate `update_updated_at_column` function with immutable search_path
    - Set search_path to 'public' to prevent security vulnerabilities
*/

-- Remove unused indexes
DROP INDEX IF EXISTS idx_survey_responses_session_id;
DROP INDEX IF EXISTS idx_social_media_selections_platform_name;
DROP INDEX IF EXISTS idx_surveys_is_active;

-- Fix duplicate RLS policies on surveys table
DROP POLICY IF EXISTS "Anyone can view active surveys" ON surveys;
DROP POLICY IF EXISTS "Anyone can view all surveys for stats" ON surveys;

-- Create single consolidated SELECT policy
-- Allow all users to view all surveys (filtering is done at application level)
CREATE POLICY "Allow viewing surveys"
  ON surveys
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Recreate function with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger for surveys table
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
