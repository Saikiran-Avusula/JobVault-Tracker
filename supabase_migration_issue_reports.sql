-- Issue reporting table for community users
create table if not exists public.issue_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    area text not null check (area in ('ui', 'backend', 'database', 'feature_request', 'other')),
    severity text not null check (severity in ('low', 'medium', 'high')),
    title text not null,
    description text not null,
    page_path text,
    contact_email text,
    status text not null default 'open' check (status in ('open', 'in_review', 'resolved')),
    created_at timestamptz not null default now()
);

alter table public.issue_reports enable row level security;

create policy if not exists "Users can create their own issue reports"
on public.issue_reports for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "Users can view their own issue reports"
on public.issue_reports for select
to authenticated
using (auth.uid() = user_id);

-- Optional: allow users to update only their own open reports
create policy if not exists "Users can update their own open issue reports"
on public.issue_reports for update
to authenticated
using (auth.uid() = user_id and status = 'open')
with check (auth.uid() = user_id and status in ('open', 'in_review', 'resolved'));
