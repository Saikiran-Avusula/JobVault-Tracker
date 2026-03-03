-- Add location column to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment to the column
COMMENT ON COLUMN job_applications.location IS 'Job location (e.g., San Francisco, CA or Remote)';
