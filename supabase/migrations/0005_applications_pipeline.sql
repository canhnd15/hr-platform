-- =============================================================
-- 0005_applications_pipeline.sql
-- Adds applicant tracking: stage, rating, last_stage_change_at on
-- applications + an application_events audit table + per-tenant
-- application_stages on tenant_ui_config.
-- =============================================================

-- 1. Applications: stage / rating / last_stage_change_at
alter table public.applications
  add column if not exists stage text not null default 'new';

alter table public.applications
  add column if not exists rating int not null default 0
  check (rating between 0 and 5);

alter table public.applications
  add column if not exists last_stage_change_at timestamptz not null default now();

-- Backfill: existing rows already default to stage='new'; align timestamp.
update public.applications
   set last_stage_change_at = coalesce(last_stage_change_at, created_at)
 where last_stage_change_at is null;

create index if not exists applications_stage_idx
  on public.applications(tenant_id, stage);

-- 2. application_events audit log
create table if not exists public.application_events (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  application_id  uuid not null references public.applications(id) on delete cascade,
  kind            text not null check (kind in ('stage_change','rating','note','reject')),
  from_stage      text,
  to_stage        text,
  rating          int,
  note            text,
  reject_reason   text,
  actor_user_id   uuid,
  created_at      timestamptz not null default now()
);

create index if not exists application_events_app_idx
  on public.application_events(application_id, created_at desc);

alter table public.application_events enable row level security;

create policy "owner read application_events"
  on public.application_events for select
  using (public.is_tenant_owner(tenant_id));

create policy "owner write application_events"
  on public.application_events for all
  using (public.is_tenant_owner(tenant_id))
  with check (public.is_tenant_owner(tenant_id));

-- 3. tenant_ui_config: application_stages JSONB list
alter table public.tenant_ui_config
  add column if not exists application_stages jsonb not null default '[]'::jsonb;

-- Seed every existing tenant that doesn't have stages yet.
update public.tenant_ui_config
   set application_stages = '[
     {"key":"new",       "label":"New",       "color":"#0ea5e9", "terminal":false},
     {"key":"interview", "label":"Interview", "color":"#a855f7", "terminal":false},
     {"key":"offer",     "label":"Offer",     "color":"#f59e0b", "terminal":false},
     {"key":"hired",     "label":"Hired",     "color":"#22c55e", "terminal":true},
     {"key":"rejected",  "label":"Rejected",  "color":"#ef4444", "terminal":true, "isReject":true}
   ]'::jsonb
 where application_stages = '[]'::jsonb or application_stages is null;

-- 4. Update bootstrap_tenant_rows() so new tenants also get the default stages.
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
  insert into public.tenant_ui_config (tenant_id, levels, categories, nav_items, locations, application_stages)
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
        {"href":"/about","label":"About","enabled":true},
        {"href":"/information","label":"Information","enabled":true},
        {"href":"/benefits","label":"Benefits","enabled":true}
      ]'::jsonb,
      '{}'::text[],
      '[
        {"key":"new",       "label":"New",       "color":"#0ea5e9", "terminal":false},
        {"key":"interview", "label":"Interview", "color":"#a855f7", "terminal":false},
        {"key":"offer",     "label":"Offer",     "color":"#f59e0b", "terminal":false},
        {"key":"hired",     "label":"Hired",     "color":"#22c55e", "terminal":true},
        {"key":"rejected",  "label":"Rejected",  "color":"#ef4444", "terminal":true, "isReject":true}
      ]'::jsonb
    )
    on conflict do nothing;
  insert into public.tenant_pages (tenant_id, page_key, content) values
    (new.id, 'information', '{"sections":[]}'::jsonb),
    (new.id, 'benefits',    '{"groups":[]}'::jsonb),
    (new.id, 'about',       '{"mode":"template","cvUrl":null,"cvFileName":null,"about":"","skills":[],"experiences":[],"education":[]}'::jsonb)
    on conflict do nothing;
  return new;
end;
$$;
