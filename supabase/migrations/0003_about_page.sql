-- =============================================================
-- 0003_about_page.sql
-- Adds an "about" page for HR profile (CV upload or template form)
-- =============================================================

-- 1. Allow 'about' as a tenant_pages page_key
alter table public.tenant_pages
  drop constraint if exists tenant_pages_page_key_check;

alter table public.tenant_pages
  add constraint tenant_pages_page_key_check
  check (page_key in ('information','benefits','about'));

-- 2. Backfill an about row for every existing tenant
insert into public.tenant_pages (tenant_id, page_key, content, visible)
select t.id,
       'about',
       '{
          "mode": "template",
          "cvUrl": null,
          "cvFileName": null,
          "about": "",
          "skills": [],
          "experiences": [],
          "education": []
        }'::jsonb,
       true
  from public.tenants t
  on conflict (tenant_id, page_key) do nothing;

-- 3. Update bootstrap_tenant_rows() so new tenants also get the about row
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
        {"href":"/about","label":"About","enabled":true},
        {"href":"/information","label":"Information","enabled":true},
        {"href":"/benefits","label":"Benefits","enabled":true}
      ]'::jsonb,
      '{}'::text[]
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

-- 4. Public 'resumes' bucket for HR-uploaded CV PDFs shown on the About page.
--    The existing private 'cvs' bucket keeps candidate-submitted applications private.
insert into storage.buckets (id, name, public)
  values ('resumes', 'resumes', true)
  on conflict (id) do nothing;

create policy "authenticated uploads resumes"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.role() = 'authenticated');

create policy "public read resumes"
  on storage.objects for select
  using (bucket_id = 'resumes');

create policy "authenticated updates resumes"
  on storage.objects for update
  using (bucket_id = 'resumes' and auth.role() = 'authenticated');

create policy "authenticated deletes resumes"
  on storage.objects for delete
  using (bucket_id = 'resumes' and auth.role() = 'authenticated');
