# Deployment Readiness Checklist

## 1) Required Environment Variables
Set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The app now fails fast when they are missing.

## 2) Applications Table (RLS)
Make sure this table exists as `public.applications` and RLS is enabled.

```sql
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own applications"
ON public.applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own applications"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own applications"
ON public.applications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own applications"
ON public.applications FOR DELETE
USING (auth.uid() = user_id);
```

## 3) Storage Policies (`resumes` bucket)
Use folder-by-user paths (`<user_id>/file.pdf`).

```sql
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 4) Account Delete RPC
A safe version that removes storage objects, app records, and auth user:

```sql
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
DECLARE
  user_folder text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  user_folder := auth.uid()::text;

  DELETE FROM storage.objects
  WHERE bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = user_folder;

  DELETE FROM public.applications WHERE user_id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 5) New Community Feature: Issue Reports
Run `supabase_migration_issue_reports.sql` to create the `issue_reports` table and policies.

This powers the in-app **Report Issue** page where users can submit:
- area (`ui`, `backend`, `database`, `feature_request`, `other`)
- severity (`low`, `medium`, `high`)
- title/description
- page path
- contact email

## 6) Security Hygiene
- `.env` is now ignored in `.gitignore`
- If `.env` was already committed, remove it from git history/index before public release
