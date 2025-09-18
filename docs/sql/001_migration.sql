-- DDL minimal + RLS + index (adapté au PRD)
create extension if not exists pgcrypto;

-- ARTICLES
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content_md text,
  tags text[] default '{}',
  cover_url text,
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

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Functions
create or replace function public.set_owner() returns trigger language plpgsql as $$
begin new.author_id := auth.uid(); return new; end $$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create or replace function public.increment_downloads(resource_id uuid) returns void language sql as $$
  update public.resources set downloads = coalesce(downloads,0) + 1 where id = resource_id;
$$;

-- Triggers
drop trigger if exists set_owner_articles on public.articles;
create trigger set_owner_articles before insert on public.articles for each row execute procedure public.set_owner();

drop trigger if exists touch_updated_articles on public.articles;
create trigger touch_updated_articles before update on public.articles for each row execute procedure public.touch_updated_at();

drop trigger if exists set_owner_resources on public.resources;
create trigger set_owner_resources before insert on public.resources for each row execute procedure public.set_owner();

drop trigger if exists touch_updated_resources on public.resources;
create trigger touch_updated_resources before update on public.resources for each row execute procedure public.touch_updated_at();

-- RLS
alter table public.articles enable row level security;
alter table public.resources enable row level security;
alter table public.messages enable row level security;

create policy if not exists articles_select_pub on public.articles for select using (published = true or auth.uid() = author_id);
create policy if not exists resources_select_pub on public.resources for select using (published = true or auth.uid() = author_id);

create policy if not exists articles_insert_own on public.articles for insert with check (author_id = auth.uid());
create policy if not exists resources_insert_own on public.resources for insert with check (author_id = auth.uid());

create policy if not exists articles_update_own on public.articles for update using (author_id = auth.uid());
create policy if not exists resources_update_own on public.resources for update using (author_id = auth.uid());

create policy if not exists articles_delete_own on public.articles for delete using (author_id = auth.uid());
create policy if not exists resources_delete_own on public.resources for delete using (author_id = auth.uid());

-- Indexes
create index if not exists idx_articles_pub_date on public.articles(published, published_at desc);
create index if not exists idx_resources_pub_cat on public.resources(published, category, published_at desc);
create index if not exists idx_articles_tags on public.articles using gin(tags);
create index if not exists idx_resources_tags on public.resources using gin(tags);


