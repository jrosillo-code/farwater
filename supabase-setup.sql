-- Farwater — database setup.
-- Paste into Supabase → SQL Editor → Run. Idempotent (safe to re-run).
-- Matches shared/schema.ts (Drizzle); alternative to `npm run db:push`.

create table if not exists users (
  id       varchar primary key default gen_random_uuid(),
  username text not null unique,
  password text not null
);

create table if not exists subscribers (
  id    varchar primary key default gen_random_uuid(),
  email text not null unique
);

create table if not exists contact_submissions (
  id           varchar primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  inquiry_type text not null,
  message      text not null
);

create table if not exists page_views (
  id         varchar primary key default gen_random_uuid(),
  path       text not null,
  referrer   text,
  user_agent text,
  timestamp  timestamptz not null default now()
);

create table if not exists analytics_events (
  id         varchar primary key default gen_random_uuid(),
  event_type text not null,
  event_data text,
  timestamp  timestamptz not null default now()
);
