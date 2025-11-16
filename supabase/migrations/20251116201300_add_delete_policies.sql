/*
  # Add DELETE policies for survey reset functionality

  1. Changes
    - Add DELETE policy for survey_responses table
    - Add DELETE policy for social_media_selections table
  
  2. Security
    - Allow anon and authenticated users to delete survey responses
    - Allow anon and authenticated users to delete social media selections
    - This enables the admin reset functionality to work properly
*/

-- Add DELETE policy for survey_responses
CREATE POLICY "Anyone can delete survey responses"
  ON survey_responses
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add DELETE policy for social_media_selections
CREATE POLICY "Anyone can delete selections"
  ON social_media_selections
  FOR DELETE
  TO anon, authenticated
  USING (true);
