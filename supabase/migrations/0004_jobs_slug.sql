-- =============================================================
-- 0004_jobs_slug.sql
-- Adds a URL slug to jobs so the public detail page can use a
-- friendly path like /u/<tenant>/jobs/senior-backend-engineer.
-- =============================================================

-- 1. Column
alter table public.jobs
  add column if not exists slug text not null default '';

-- 2. Backfill existing rows
--    Build a base slug from the title (lowercase, non-alphanumeric -> '-',
--    collapse repeats, trim '-'). Rows that share the same (tenant_id, base)
--    are deduped by appending '-2', '-3', … via row_number() over (...).
with sluggified as (
  select
    id,
    tenant_id,
    created_at,
    btrim(
      regexp_replace(
        regexp_replace(lower(coalesce(title, '')), '[^a-z0-9]+', '-', 'g'),
        '-+', '-', 'g'
      ),
      '-'
    ) as base_slug
  from public.jobs
), numbered as (
  select
    id,
    tenant_id,
    case when base_slug = '' then 'job' else base_slug end as base_slug,
    row_number() over (
      partition by tenant_id,
      case when base_slug = '' then 'job' else base_slug end
      order by created_at, id
    ) as rn
  from sluggified
)
update public.jobs j
   set slug = case when n.rn = 1 then n.base_slug else n.base_slug || '-' || n.rn end
  from numbered n
 where n.id = j.id
   and (j.slug is null or j.slug = '');

-- 3. Uniqueness per tenant (partial — empty slugs are allowed during edits
--    but in practice the app always writes a non-empty value).
create unique index if not exists jobs_tenant_slug_idx
  on public.jobs(tenant_id, slug)
  where slug <> '';
