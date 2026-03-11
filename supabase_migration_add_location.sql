-- Add location column to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment to the column
COMMENT ON COLUMN applications.location IS 'Job location (e.g., San Francisco, CA or Remote)';
