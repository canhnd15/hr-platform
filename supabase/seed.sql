-- =============================================================
-- Demo tenant for /u/demo — mirrors the current hardcoded data.
-- Run AFTER 0001_init.sql.
-- Requires an existing auth.users row to point owner_user_id at.
-- =============================================================
do $$
declare
  v_owner uuid;
  v_tenant uuid := '11111111-1111-1111-1111-111111111111';
begin
  -- Use the first auth user as the demo owner. Create one in the
  -- Supabase dashboard (or via sign-up) before running this seed.
  select id into v_owner from auth.users order by created_at asc limit 1;
  if v_owner is null then
    raise notice 'No auth.users found — sign up at least once before running the seed.';
    return;
  end if;

  insert into public.tenants (id, slug, owner_user_id, status, plan)
    values (v_tenant, 'demo', v_owner, 'active', 'free')
    on conflict (id) do nothing;

  -- bootstrap_tenant_rows trigger has populated the rest with defaults.
  -- Update them with the demo content.

  update public.tenant_branding set
    primary_color = '#036ae5',
    theme_preset  = 'thuy',
    font_family   = 'Be Vietnam Pro'
   where tenant_id = v_tenant;

  update public.tenant_profile set
    full_name          = 'Ms. Jane Doe',
    email              = 'jane.doe@example.com',
    title              = 'Recruitment Specialist',
    years_experience   = 5,
    specialty          = 'Talent Acquisition',
    tagline            = 'Connecting talents with the right opportunities',
    socials            = '{
      "facebook":"https://facebook.com/",
      "telegram":"https://t.me/",
      "whatsapp":"https://wa.me/",
      "linkedin":"https://linkedin.com/"
    }'::jsonb,
    cta_url            = 'https://cal.com/your-handle/15min'
  where tenant_id = v_tenant;

  update public.tenant_company set
    name                   = 'Acme Co',
    full_name              = 'Acme Co (State-of-the-Art-Technology)',
    size_range             = '1000 - 2000',
    headquarter            = 'Hanoi, Vietnam',
    representative_offices = 'US, Japan, Korea and Australia',
    main_clients           = 'US & NA, EU, UK, ANZ, and Asia',
    description            = ''
   where tenant_id = v_tenant;

  update public.tenant_pages set
    content = '{
      "sections":[
        {"title":"About us","body":"Acme Co offers leading tech experts with strong determination, enthusiasm and commitment to providing the most hi-tech IT services, with the ultimate goal to enable your business success through digital transformation."},
        {"title":"Our reach","body":"During 10+ years of development, we have gathered over 1000 talented IT consultants and developers who share deep expertise to successfully provide full-cycle IT services to our Clients from 30+ nations worldwide, with 500+ projects in various industries."}
      ]
    }'::jsonb
   where tenant_id = v_tenant and page_key = 'information';

  update public.tenant_pages set
    content = '{
      "groups":[
        {"title":"🎯 Flexible working regime and health care","bullets":[
          "Flexible timekeeping (from 8:00 - 9:00 to 17:30 - 18:30)",
          "Minimum 14 paid leaves per annum for all employees after probation",
          "01-day remote work per month",
          "Social insurance, health insurance, premium health care"
        ]},
        {"title":"🎯 Transparent and fair benefits","bullets":[
          "Saturday & Sunday OFF, OT pay 150%/200%/300% per labor law",
          "Work performance review 2 times/year",
          "13th-month salary and performance-based bonus"
        ]},
        {"title":"🎯 Dynamic environment and open culture","bullets":[
          "Year-end party, sports day, yearly company trip, quarterly team-building",
          "Monthly Happy Hour, free coffee/tea/drinks",
          "Allowance when joining clubs: Soccer, Swimming, Yoga, Music"
        ]},
        {"title":"🎯 Strong learning culture","bullets":[
          "Free training for technical and soft skills",
          "Access to internal LMS with thousands of lectures",
          "Workshops, seminars, tech talks with internal and external experts"
        ]}
      ]
    }'::jsonb
   where tenant_id = v_tenant and page_key = 'benefits';

  insert into public.jobs (id, tenant_id, title, level, type, salary, company, location, is_hot, display_order, status) values
    (gen_random_uuid(), v_tenant, 'Senior Backend Engineer (Java/Spring Boot)',     'Senior',  'Full-Time',  '$2,500 - $4,000', 'Engineering & Technology — Acme Co', 'Hanoi, Vietnam',       true,  1, 'published'),
    (gen_random_uuid(), v_tenant, 'Frontend Engineer (React / Next.js)',            'Middle',  'Full-Time',  '$1,500 - $2,500', 'Engineering & Technology — Acme Co', 'Hanoi, Vietnam',       false, 2, 'published'),
    (gen_random_uuid(), v_tenant, 'Blockchain Developer (Solidity)',                'Senior',  'Full-Time',  'Negotiable',      'Engineering & Technology — Acme Co', 'Ho Chi Minh, Vietnam', true,  3, 'published'),
    (gen_random_uuid(), v_tenant, 'Product Marketing Specialist',                   'Junior',  'Full-Time',  '$800 - $1,200',   'Sales & Marketing — Acme Co',        'Hanoi, Vietnam',       false, 4, 'published'),
    (gen_random_uuid(), v_tenant, 'HR Business Partner',                            'Manager', 'Full-Time',  '$2,000 - $3,000', 'Back Office — Acme Co',              'Hanoi, Vietnam',       false, 5, 'published'),
    (gen_random_uuid(), v_tenant, 'DevOps Engineer (AWS / Kubernetes)',             'Middle',  'Full-Time',  '$1,800 - $2,800', 'Engineering & Technology — Acme Co', 'Ho Chi Minh, Vietnam', false, 6, 'published'),
    (gen_random_uuid(), v_tenant, 'Frontend Intern',                                'Intern',  'Internship', 'Allowance',       'Engineering & Technology — Acme Co', 'Hanoi, Vietnam',       false, 7, 'published'),
    (gen_random_uuid(), v_tenant, 'Customer Success Lead',                          'Leader',  'Full-Time',  '$1,500 - $2,200', 'Operation Support — Acme Co',        'Da Nang, Vietnam',     false, 8, 'published');
end $$;
