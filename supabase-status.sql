-- Run once in the Supabase SQL editor to enable server-side application
-- statuses in the Ops Room (until then statuses are stored per-device).
alter table contact_submissions
  add column if not exists status text not null default 'new';
