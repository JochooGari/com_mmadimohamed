-- Migration: Power BI Dashboards Library
-- Création des tables pour la bibliothèque de ressources Power BI

-- Extensions
create extension if not exists pgcrypto;

-- TABLE: powerbi_dashboards
create table if not exists public.powerbi_dashboards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  long_description text,

  -- Taxonomie
  topic text not null check (topic in ('finance', 'comptabilite', 'sales', 'marketing', 'supply-chain')),
  sub_topics text[] default '{}',
  personas text[] default '{}',

  -- Métadonnées
  complexity text not null check (complexity in ('debutant', 'intermediaire', 'avance')),
  visualization_types text[] default '{}',
  powerbi_version text,
  data_sources text[] default '{}',

  -- Médias
  thumbnail_url text,
  screenshots text[] default '{}',
  preview_url text,

  -- Fichiers
  pbix_file_url text,
  pbit_file_url text,
  documentation_url text,

  -- Stats
  views int not null default 0,
  downloads int not null default 0,
  rating numeric(3,2) default 0.00 check (rating >= 0 and rating <= 5),
  rating_count int not null default 0,

  -- SEO & Publication
  published boolean default false,
  featured boolean default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Contenu technique
  dax_measures jsonb default '[]',
  use_cases text[] default '{}',
  installation_guide text,

  -- Auteur
  author_id uuid not null default auth.uid()
);

-- TABLE: dashboard_kpis (KPIs associés à un dashboard)
create table if not exists public.dashboard_kpis (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.powerbi_dashboards(id) on delete cascade,
  name text not null,
  description text,
  formula text,
  display_order int default 0,
  created_at timestamptz not null default now()
);

-- TABLE: dashboard_ratings (Notes utilisateurs)
create table if not exists public.dashboard_ratings (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.powerbi_dashboards(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dashboard_id, user_id)
);

-- TABLE: dashboard_downloads (Tracking des téléchargements)
create table if not exists public.dashboard_downloads (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.powerbi_dashboards(id) on delete cascade,
  user_email text,
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

-- Trigger: updated_at pour powerbi_dashboards
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='tr_powerbi_dashboards_updated_at') then
    create trigger tr_powerbi_dashboards_updated_at before update on public.powerbi_dashboards
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname='tr_dashboard_ratings_updated_at') then
    create trigger tr_dashboard_ratings_updated_at before update on public.dashboard_ratings
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Function: Increment views
create or replace function public.increment_dashboard_views(dashboard_uuid uuid)
returns void language plpgsql security definer as $$
begin
  update public.powerbi_dashboards
  set views = views + 1
  where id = dashboard_uuid;
end$$;

-- Function: Increment downloads
create or replace function public.increment_dashboard_downloads(dashboard_uuid uuid)
returns void language plpgsql security definer as $$
begin
  update public.powerbi_dashboards
  set downloads = downloads + 1
  where id = dashboard_uuid;
end$$;

-- Function: Update rating moyenne
create or replace function public.update_dashboard_rating()
returns trigger language plpgsql as $$
declare
  avg_rating numeric;
  total_count int;
begin
  select avg(rating), count(*) into avg_rating, total_count
  from public.dashboard_ratings
  where dashboard_id = coalesce(new.dashboard_id, old.dashboard_id);

  update public.powerbi_dashboards
  set rating = round(avg_rating, 2),
      rating_count = total_count
  where id = coalesce(new.dashboard_id, old.dashboard_id);

  return coalesce(new, old);
end$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='tr_update_dashboard_rating_insert') then
    create trigger tr_update_dashboard_rating_insert after insert on public.dashboard_ratings
    for each row execute function public.update_dashboard_rating();
  end if;
  if not exists (select 1 from pg_trigger where tgname='tr_update_dashboard_rating_update') then
    create trigger tr_update_dashboard_rating_update after update on public.dashboard_ratings
    for each row execute function public.update_dashboard_rating();
  end if;
  if not exists (select 1 from pg_trigger where tgname='tr_update_dashboard_rating_delete') then
    create trigger tr_update_dashboard_rating_delete after delete on public.dashboard_ratings
    for each row execute function public.update_dashboard_rating();
  end if;
end $$;

-- RLS
alter table public.powerbi_dashboards enable row level security;
alter table public.dashboard_kpis enable row level security;
alter table public.dashboard_ratings enable row level security;
alter table public.dashboard_downloads enable row level security;

-- POLICIES: powerbi_dashboards
create policy if not exists dashboards_select_published on public.powerbi_dashboards
for select using (published = true or auth.uid() = author_id);

create policy if not exists dashboards_insert_own on public.powerbi_dashboards
for insert with check (author_id = auth.uid());

create policy if not exists dashboards_update_own on public.powerbi_dashboards
for update using (author_id = auth.uid());

create policy if not exists dashboards_delete_own on public.powerbi_dashboards
for delete using (author_id = auth.uid());

-- POLICIES: dashboard_kpis
create policy if not exists kpis_select_all on public.dashboard_kpis
for select using (
  exists (
    select 1 from public.powerbi_dashboards
    where id = dashboard_kpis.dashboard_id
    and (published = true or author_id = auth.uid())
  )
);

create policy if not exists kpis_insert_own on public.dashboard_kpis
for insert with check (
  exists (
    select 1 from public.powerbi_dashboards
    where id = dashboard_kpis.dashboard_id
    and author_id = auth.uid()
  )
);

create policy if not exists kpis_update_own on public.dashboard_kpis
for update using (
  exists (
    select 1 from public.powerbi_dashboards
    where id = dashboard_kpis.dashboard_id
    and author_id = auth.uid()
  )
);

create policy if not exists kpis_delete_own on public.dashboard_kpis
for delete using (
  exists (
    select 1 from public.powerbi_dashboards
    where id = dashboard_kpis.dashboard_id
    and author_id = auth.uid()
  )
);

-- POLICIES: dashboard_ratings
create policy if not exists ratings_select_all on public.dashboard_ratings
for select using (true);

create policy if not exists ratings_insert_own on public.dashboard_ratings
for insert with check (auth.uid() = user_id);

create policy if not exists ratings_update_own on public.dashboard_ratings
for update using (auth.uid() = user_id);

create policy if not exists ratings_delete_own on public.dashboard_ratings
for delete using (auth.uid() = user_id);

-- POLICIES: dashboard_downloads (lecture privée, insertion via API)
revoke all on table public.dashboard_downloads from anon, authenticated;
grant insert on table public.dashboard_downloads to service_role;
grant select on table public.dashboard_downloads to service_role;

-- INDEXES
create index if not exists idx_powerbi_dashboards_published on public.powerbi_dashboards (published, published_at desc);
create index if not exists idx_powerbi_dashboards_topic on public.powerbi_dashboards (topic, published);
create index if not exists idx_powerbi_dashboards_complexity on public.powerbi_dashboards (complexity, published);
create index if not exists idx_powerbi_dashboards_featured on public.powerbi_dashboards (featured, published);
create index if not exists idx_powerbi_dashboards_sub_topics on public.powerbi_dashboards using gin(sub_topics);
create index if not exists idx_powerbi_dashboards_personas on public.powerbi_dashboards using gin(personas);
create index if not exists idx_powerbi_dashboards_viz_types on public.powerbi_dashboards using gin(visualization_types);
create index if not exists idx_dashboard_kpis_dashboard_id on public.dashboard_kpis (dashboard_id, display_order);
create index if not exists idx_dashboard_ratings_dashboard_id on public.dashboard_ratings (dashboard_id);
create index if not exists idx_dashboard_downloads_dashboard_id on public.dashboard_downloads (dashboard_id, downloaded_at desc);

-- Full text search (pour recherche textuelle)
alter table public.powerbi_dashboards add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', array_to_string(coalesce(sub_topics, '{}'), ' ')), 'C')
  ) stored;

create index if not exists idx_powerbi_dashboards_search on public.powerbi_dashboards using gin(search_vector);
