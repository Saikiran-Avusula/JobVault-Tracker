# Supabase RPC Function for Account Deletion

## Problem
The current `delete_user` RPC function fails with error:
```
Direct deletion from storage tables is not allowed. Use the Storage API instead.
```

## Solution
Create this SQL function in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
  resume_path text;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete all resume files from storage for this user
  -- Loop through all applications and delete their resume files
  FOR resume_path IN 
    SELECT resume_text 
    FROM applications 
    WHERE user_id = user_uuid 
    AND resume_text IS NOT NULL
  LOOP
    -- Delete from storage bucket using storage.objects
    DELETE FROM storage.objects 
    WHERE bucket_id = 'resumes' 
    AND name = resume_path;
  END LOOP;

  -- Delete all applications (this will cascade to related data)
  DELETE FROM applications WHERE user_id = user_uuid;

  -- Delete the auth user (this requires admin privileges)
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;
```

## Alternative Simpler Approach (Recommended)

If the above still fails, use this simpler version that relies on CASCADE deletes:

```sql
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Just delete the user - let CASCADE handle the rest
  -- Make sure your applications table has ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;
```

## Setup Instructions

1. Go to Supabase Dashboard → SQL Editor
2. Run one of the SQL functions above
3. Ensure your `applications` table has proper CASCADE:
   ```sql
   ALTER TABLE applications 
   DROP CONSTRAINT IF EXISTS applications_user_id_fkey;
   
   ALTER TABLE applications 
   ADD CONSTRAINT applications_user_id_fkey 
   FOREIGN KEY (user_id) 
   REFERENCES auth.users(id) 
   ON DELETE CASCADE;
   ```

## Storage Bucket Policy

Ensure the `resumes` bucket has a policy for deletion:

```sql
-- Allow users to delete their own resume files
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
```
