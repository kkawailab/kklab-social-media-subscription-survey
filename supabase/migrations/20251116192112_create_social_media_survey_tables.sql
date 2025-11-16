/*
  # Social Media Survey Database Schema

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key) - Unique identifier for each survey response
      - `session_id` (text) - Anonymous session identifier to prevent duplicate submissions
      - `created_at` (timestamptz) - Timestamp when the response was submitted
      
    - `social_media_selections`
      - `id` (uuid, primary key) - Unique identifier for each selection
      - `response_id` (uuid, foreign key) - References the survey response
      - `platform_name` (text) - Name of the social media platform
      - `created_at` (timestamptz) - Timestamp of the selection

  2. Security
    - Enable RLS on both tables
    - Allow public INSERT access for survey submissions
    - Allow public SELECT access for viewing aggregated results
    - Prevent UPDATE and DELETE operations from public users

  3. Indexes
    - Add index on session_id for duplicate checking
    - Add index on platform_name for aggregation queries
    - Add index on response_id for joining tables

  4. Notes
    - Session-based tracking allows anonymous submissions while preventing spam
    - Normalized structure allows for flexible querying and statistics
    - Public read access enables real-time results viewing
*/

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create social_media_selections table
CREATE TABLE IF NOT EXISTS social_media_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_social_media_selections_response_id ON social_media_selections(response_id);
CREATE INDEX IF NOT EXISTS idx_social_media_selections_platform_name ON social_media_selections(platform_name);

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_selections ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert survey responses (public submissions)
CREATE POLICY "Anyone can submit survey responses"
  ON survey_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to view survey responses (for statistics)
CREATE POLICY "Anyone can view survey responses"
  ON survey_responses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert social media selections
CREATE POLICY "Anyone can submit selections"
  ON social_media_selections
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to view selections (for aggregation)
CREATE POLICY "Anyone can view selections"
  ON social_media_selections
  FOR SELECT
  TO anon, authenticated
  USING (true);