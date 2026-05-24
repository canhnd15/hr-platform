-- =============================================================
-- HR Recruitment Platform — initial schema
-- Multi-tenant: every public table carries tenant_id and is
-- scoped by Row Level Security. Public reads are allowed for
-- active tenants; writes are restricted to the tenant owner.
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- tenants (one row per HR/recruiter account)
-- -------------------------------------------------------------
create table public.tenants (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  owner_user_id   uuid not null references auth.users(id) on delete cascade,
  status          text not null default 'active' check (status in ('active','suspended')),
  plan            text not null default 'free',
  created_at      timestamptz not null default now()
);

create index tenants_owner_idx on public.tenants(owner_user_id);

-- -------------------------------------------------------------
-- tenant_branding (1:1 with tenants)
-- -------------------------------------------------------------
create table public.tenant_branding (
  tenant_id       uuid primary key references public.tenants(id) on delete cascade,
  logo_url        text,
  primary_color   text not null default '#036ae5',
  theme_preset    text not null default 'thuy' check (theme_preset in ('kim','moc','thuy','hoa','tho','custom')),
  font_family     text not null default 'Be Vietnam Pro'
);

-- -------------------------------------------------------------
-- tenant_profile
-- -------------------------------------------------------------
create table public.tenant_profile (
  tenant_id              uuid primary key references public.tenants(id) on delete cascade,
  full_name              text not null default '',
  email                  text not null default '',
  avatar_url             text,
  title                  text not null default 'Recruitment Specialist',
  years_experience       int  not null default 0,
  specialty              text not null default 'Talent Acquisition',
  tagline                text not null default '',
  socials                jsonb not null default '{}'::jsonb,
  cta_url                text not null default ''
);

-- -------------------------------------------------------------
-- tenant_company
-- -------------------------------------------------------------
create table public.tenant_company (
  tenant_id                uuid primary key references public.tenants(id) on delete cascade,
  name                     text not null default '',
  full_name                text not null default '',
  size_range               text not null default '',
  headquarter              text not null default '',
  representative_offices   text not null default '',
  main_clients             text not null default '',
  description              text not null default ''
);

-- -------------------------------------------------------------
-- tenant_ui_config
-- -------------------------------------------------------------
create table public.tenant_ui_config (
  tenant_id                 uuid primary key references public.tenants(id) on delete cascade,
  show_locations_filter     boolean not null default true,
  show_level_filter         boolean not null default true,
  show_category_filter      boolean not null default true,
  locations                 text[] not null default '{}',
  levels                    jsonb  not null default '[]'::jsonb,
  categories                jsonb  not null default '[]'::jsonb,
  nav_items                 jsonb  not null default '[]'::jsonb
);

-- -------------------------------------------------------------
-- tenant_pages (one row per page key: 'information' | 'benefits')
-- -------------------------------------------------------------
create table public.tenant_pages (
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  page_key     text not null check (page_key in ('information','benefits')),
  content      jsonb not null default '{}'::jsonb,
  visible      boolean not null default true,
  primary key (tenant_id, page_key)
);

-- -------------------------------------------------------------
-- jobs
-- -------------------------------------------------------------
create table public.jobs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  title           text not null,
  level           text not null default '',
  type            text not null default 'Full-Time' check (type in ('Full-Time','Part-Time','Internship')),
  salary          text not null default '',
  company         text not null default '',
  location        text not null default '',
  description     text not null default '',
  requirements    text not null default '',
  benefits        text not null default '',
  is_hot          boolean not null default false,
  display_order   int not null default 0,
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  created_at      timestamptz not null default now()
);

create index jobs_tenant_status_idx on public.jobs(tenant_id, status, display_order);

-- -------------------------------------------------------------
-- applications (apply or refer)
-- -------------------------------------------------------------
create table public.applications (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  job_id            uuid not null references public.jobs(id) on delete cascade,
  form_type         text not null default 'apply' check (form_type in ('apply','refer')),
  name              text not null,
  phone             text not null,
  email             text not null,
  candidate_name    text,
  candidate_phone   text,
  candidate_email   text,
  cv_url            text,
  created_at        timestamptz not null default now()
);

create index applications_tenant_idx on public.applications(tenant_id, created_at desc);

-- =============================================================
-- Row Level Security
-- =============================================================

alter table public.tenants          enable row level security;
alter table public.tenant_branding  enable row level security;
alter table public.tenant_profile   enable row level security;
alter table public.tenant_company   enable row level security;
alter table public.tenant_ui_config enable row level security;
alter table public.tenant_pages     enable row level security;
alter table public.jobs             enable row level security;
alter table public.applications     enable row level security;

-- Helper: is the current user the owner of this tenant?
create or replace function public.is_tenant_owner(t_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenants
    where id = t_id and owner_user_id = auth.uid()
  );
$$;

-- ---- tenants -------------------------------------------------
create policy "public read active tenants"
  on public.tenants for select
  using (status = 'active');

create policy "owner full access tenants"
  on public.tenants for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- ---- tenant_* (shared pattern) -------------------------------
create policy "public read tenant_branding"
  on public.tenant_branding for select using (true);
create policy "owner write tenant_branding"
  on public.tenant_branding for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

create policy "public read tenant_profile"
  on public.tenant_profile for select using (true);
create policy "owner write tenant_profile"
  on public.tenant_profile for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

create policy "public read tenant_company"
  on public.tenant_company for select using (true);
create policy "owner write tenant_company"
  on public.tenant_company for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

create policy "public read tenant_ui_config"
  on public.tenant_ui_config for select using (true);
create policy "owner write tenant_ui_config"
  on public.tenant_ui_config for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

create policy "public read tenant_pages"
  on public.tenant_pages for select using (visible = true);
create policy "owner write tenant_pages"
  on public.tenant_pages for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

-- ---- jobs ----------------------------------------------------
create policy "public read published jobs"
  on public.jobs for select
  using (status = 'published');

create policy "owner full access jobs"
  on public.jobs for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

-- ---- applications -------------------------------------------
-- Anyone (including unauthenticated) can submit one.
create policy "public insert applications"
  on public.applications for insert
  with check (true);

-- Only the tenant owner can read their own applications.
create policy "owner read applications"
  on public.applications for select
  using (public.is_tenant_owner(tenant_id));

create policy "owner write applications"
  on public.applications for update using (public.is_tenant_owner(tenant_id));
create policy "owner delete applications"
  on public.applications for delete using (public.is_tenant_owner(tenant_id));

-- =============================================================
-- Storage buckets
-- =============================================================
-- 'logos' and 'avatars' are public-read so the browser can <img> them.
-- 'cvs' is private; tenant owners get signed URLs.
insert into storage.buckets (id, name, public)
values
  ('logos',   'logos',   true),
  ('avatars', 'avatars', true),
  ('cvs',     'cvs',     false)
on conflict (id) do nothing;

-- Authenticated users can write to logos/avatars/cvs.
-- (Tighter per-tenant rules can be added once the admin UI lands.)
create policy "authenticated uploads logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "authenticated uploads avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "anyone uploads cvs"
  on storage.objects for insert
  with check (bucket_id = 'cvs');

create policy "public read logos"
  on storage.objects for select
  using (bucket_id = 'logos');
create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- =============================================================
-- Auto-provision tenant_* rows on tenant create
-- =============================================================
create or replace function public.bootstrap_tenant_rows()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tenant_branding  (tenant_id) values (new.id) on conflict do nothing;
  insert into public.tenant_profile   (tenant_id) values (new.id) on conflict do nothing;
  insert into public.tenant_company   (tenant_id) values (new.id) on conflict do nothing;
  insert into public.tenant_ui_config (tenant_id, levels, categories, nav_items, locations)
    values (
      new.id,
      '[
        {"value":"all","label":"All Level"},
        {"value":"fresher","label":"Fresher"},
        {"value":"intern","label":"Intern"},
        {"value":"junior","label":"Junior"},
        {"value":"middle","label":"Middle"},
        {"value":"senior","label":"Senior"},
        {"value":"leader","label":"Leader"},
        {"value":"manager","label":"Manager"}
      ]'::jsonb,
      '[
        {"value":"back-office","label":"Back Office","keyword":"back office"},
        {"value":"engineering","label":"Engineering & Technology","keyword":"engineering"},
        {"value":"operation","label":"Operation Support","keyword":"operation"},
        {"value":"sales","label":"Sales & Marketing","keyword":"sales"}
      ]'::jsonb,
      '[
        {"href":"/","label":"List Jobs","enabled":true},
        {"href":"/information","label":"Information","enabled":true},
        {"href":"/benefits","label":"Benefits","enabled":true}
      ]'::jsonb,
      '{}'::text[]
    )
    on conflict do nothing;
  insert into public.tenant_pages (tenant_id, page_key, content) values
    (new.id, 'information', '{"sections":[]}'::jsonb),
    (new.id, 'benefits',    '{"groups":[]}'::jsonb)
    on conflict do nothing;
  return new;
end;
$$;

create trigger tenants_bootstrap_after_insert
  after insert on public.tenants
  for each row execute function public.bootstrap_tenant_rows();
