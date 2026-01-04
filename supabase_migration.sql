-- Migration: Update applications table to include status and make job_description optional
-- Add status column
ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Applied';

-- Make job_description optional (can be null)
ALTER TABLE applications ALTER COLUMN job_description DROP NOT NULL;

-- Update existing records to have status 'Applied' if null
UPDATE applications SET status = 'Applied' WHERE status IS NULL;

