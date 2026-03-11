-- Convert legacy status values from 'Interview' to 'Technical Interview'
-- Run this once in Supabase SQL Editor.

begin;

update public.applications
set status = 'Technical Interview'
where status = 'Interview';

commit;

