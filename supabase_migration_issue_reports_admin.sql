alter table public.issue_reports
    add column if not exists attachment_path text,
    add column if not exists admin_message text,
    add column if not exists updated_at timestamptz not null default now();

alter table public.issue_reports
    drop constraint if exists issue_reports_status_check;

alter table public.issue_reports
    add constraint issue_reports_status_check
    check (status in ('open', 'in_progress', 'in_review', 'resolved'));

drop policy if exists "Users can update their own open issue reports" on public.issue_reports;

drop policy if exists "Admin can view all issue reports" on public.issue_reports;

create policy "Admin can view all issue reports"
on public.issue_reports for select
to authenticated
using ((auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com');

drop policy if exists "Admin can update all issue reports" on public.issue_reports;

create policy "Admin can update all issue reports"
on public.issue_reports for update
to authenticated
using ((auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com')
with check ((auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com');

insert into storage.buckets (id, name, public)
values ('issue-attachments', 'issue-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own issue attachments" on storage.objects;

create policy "Users can upload their own issue attachments"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'issue-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can view their own issue attachments" on storage.objects;

create policy "Users can view their own issue attachments"
on storage.objects for select
to authenticated
using (
    bucket_id = 'issue-attachments'
    and (
        (storage.foldername(name))[1] = auth.uid()::text
        or (auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com'
    )
);

drop policy if exists "Admin can update issue attachments" on storage.objects;

create policy "Admin can update issue attachments"
on storage.objects for update
to authenticated
using (
    bucket_id = 'issue-attachments'
    and (auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com'
)
with check (
    bucket_id = 'issue-attachments'
    and (auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com'
);

drop policy if exists "Admin can delete issue attachments" on storage.objects;

create policy "Admin can delete issue attachments"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'issue-attachments'
    and (auth.jwt() ->> 'email') = 'saikiranavusula89@gmail.com'
);
