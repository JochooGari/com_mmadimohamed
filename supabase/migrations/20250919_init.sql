-- Supabase schema (MVP) — Articles, Resources, Messages

-- Extensions utiles (si non activées)
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ARTICLES
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content jsonb,
  cover_url text,
  tags text[] default '{}',
  published boolean default false,
  published_at timestamptz,
  author_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RESOURCES
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  file_url text,
  thumb_url text,
  category text,
  tags text[] default '{}',
  downloads int not null default 0,
  published boolean default false,
  published_at timestamptz,
  author_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MESSAGES (contact)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Trigger simple updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='tr_articles_updated_at') then
    create trigger tr_articles_updated_at before update on public.articles
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname='tr_resources_updated_at') then
    create trigger tr_resources_updated_at before update on public.resources
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS
alter table public.articles enable row level security;
alter table public.resources enable row level security;
alter table public.messages enable row level security; -- lecture non publique, écriture via server‑side

-- ARTICLES policies
create policy if not exists articles_select_published on public.articles
for select using (published = true or auth.uid() = author_id);

create policy if not exists articles_insert_own on public.articles
for insert with check (author_id = auth.uid());

create policy if not exists articles_update_own on public.articles
for update using (author_id = auth.uid());

create policy if not exists articles_delete_own on public.articles
for delete using (author_id = auth.uid());

-- RESOURCES policies
create policy if not exists resources_select_published on public.resources
for select using (published = true or auth.uid() = author_id);

create policy if not exists resources_insert_own on public.resources
for insert with check (author_id = auth.uid());

create policy if not exists resources_update_own on public.resources
for update using (author_id = auth.uid());

create policy if not exists resources_delete_own on public.resources
for delete using (author_id = auth.uid());

-- messages: aucune permission publique; insertion via API server uniquement
revoke all on table public.messages from anon, authenticated;

-- Index
create index if not exists idx_articles_published_date on public.articles (published, published_at desc);
create index if not exists idx_resources_pub_cat_date on public.resources (published, category, published_at desc);
create index if not exists idx_articles_tags on public.articles using gin(tags);
create index if not exists idx_resources_tags on public.resources using gin(tags);




