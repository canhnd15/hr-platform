-- =============================================================
-- Add location-type and structured salary fields to jobs.
-- The existing `salary` text column stays as the display string;
-- the new columns store the structured input so it can be edited.
-- =============================================================

alter table public.jobs
  add column if not exists location_type text
    check (location_type in ('Onsite', 'Hybrid', 'Remote'))
    default 'Onsite';

alter table public.jobs
  add column if not exists salary_min int,
  add column if not exists salary_max int,
  add column if not exists salary_currency text
    check (salary_currency in ('USD', 'VND'));
