
image.png## PRD — Site vitrine + Bibliothèque + Blog

Version: MVP

### 1) Objectifs
- **Publier** un site vitrine avec « Bibliothèque de ressources » et « Blog » + back‑office simple.
- **Générer des leads** via formulaire contact et téléchargements.
- **SEO propre**: robots.txt, sitemaps dynamiques, métadonnées, JSON‑LD, performance.
- **Automatiser** la production de contenus (brouillons) et une **veille/prospection** basique.

Nouveaux objectifs (Admin)
- **Workflows IA** façon n8n/Make: construction visuelle, exécution pas‑à‑pas, statuts live.
- **Content pipeline automatisé**: Research → Ghostwriting → Lead validation → CEO approval → Community publish → Analyst feedback → amélioration continue. L’utilisateur ne fait que valider.
- **Base de connaissances locale** partagée (Research/Content/Performance) pour synchroniser tous les agents IA.

### 2) Périmètre (MVP)
- **Pages publiques**: `Accueil`, `/bibliotheque`, `/blog`, `Détail Ressource`, `Détail Article`, `Politique/RGPD`.
- **Back‑office minimal**: `/admin` (Supabase Auth) pour créer/éditer:
  - Ressources (PDF, templates, vidéos)
  - Articles (brouillon → publié)
  - Upload fichiers via Supabase Storage
- **Formulaire de contact** → table `messages` + notification email.
- **SEO auto**: `/robots.txt`, `/sitemap.xml` (index) + `/sitemap-articles.xml` + `/sitemap-ressources.xml`, JSON‑LD.
- **Analytics & events**: pageview, clic "Télécharger", soumission contact.

### 3) Utilisateurs / Personas
- **Visiteur** (prospect, recruteur): lit, filtre, télécharge, contacte.
- **Admin** (toi): ajoute/modifie contenu, met en avant des items.

### 4) KPI succès
- Trafic organique (sessions/mois), temps passé.
- Téléchargements ressources / CTA cliqués.
- Leads (messages / propositions).
- Taux d’indexation (GSC), # pages valides sitemap.

---

## 5) Modèle de données (Supabase)

PostgreSQL, Row Level Security activée et durcie. Colonnes `author_id` par défaut `auth.uid()`.

### Schéma SQL (DDL)
```sql
-- Extensions utiles (si non activées)
create extension if not exists pgcrypto; -- pour gen_random_uuid()

-- ARTICLES
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content jsonb, -- ou markdown stocké en text si préféré
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
  file_url text,         -- PDF/ZIP/vidéo
  thumb_url text,
  category text,         -- ex: 'Pharma' | 'Marketing' | 'Sales'
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
```

### RLS (policies)
```sql
alter table public.articles enable row level security;
alter table public.resources enable row level security;
alter table public.messages enable row level security; -- lecture non publique, écriture via API server-side

-- ARTICLES
create policy if not exists articles_select_published on public.articles
for select using (published = true or auth.uid() = author_id);

create policy if not exists articles_insert_own on public.articles
for insert with check (author_id = auth.uid());

create policy if not exists articles_update_own on public.articles
for update using (author_id = auth.uid());

create policy if not exists articles_delete_own on public.articles
for delete using (author_id = auth.uid());

-- RESOURCES (mêmes règles)
create policy if not exists resources_select_published on public.resources
for select using (published = true or auth.uid() = author_id);

create policy if not exists resources_insert_own on public.resources
for insert with check (author_id = auth.uid());

create policy if not exists resources_update_own on public.resources
for update using (author_id = auth.uid());

create policy if not exists resources_delete_own on public.resources
for delete using (author_id = auth.uid());

-- MESSAGES : écriture par API server-side uniquement (service role)
revoke all on table public.messages from anon, authenticated;
```

### Index
```sql
create index if not exists idx_articles_published_date on public.articles (published, published_at desc);
create index if not exists idx_resources_pub_cat_date on public.resources (published, category, published_at desc);
create index if not exists idx_articles_tags on public.articles using gin(tags);
create index if not exists idx_resources_tags on public.resources using gin(tags);
```

### Storage (buckets)
```
resources  → fichiers (PDF/ZIP)
images     → couvertures/miniatures
```
Politiques: lecture publique pour contenus publiés ou **URL signée** côté admin. Recommandation: garder `resources` privé et publier via URLs signées; sinon s’assurer qu’on ne charge que des éléments publiés.

---

## 6) Architecture & Back‑end

### Front
- Vite + React + TypeScript + Tailwind + `react-router-dom` + `shadcn/ui`.
- Routes publiques: `/`, `/bibliotheque`, `/blog`, `/resource/:slug`, `/blog/:slug`, `/politique`.
 - Déploiement SPA: `vercel.json` réécrit toutes les routes client vers `index.html` (fallback SPA) tout en préservant `/api/*` et `robots/sitemaps`.

### BFF (Vercel Functions, TypeScript, dossier `/api`)
- `/api/sitemap` → génère l’index et sous‑sitemaps depuis Supabase (cache 6h).
- `/api/robots` → robots.txt pointant vers le sitemap.
- `/api/contact` → POST du formulaire, insert `messages`, envoi email via Resend/SMTP.
- `/api/og` (option) → images OpenGraph dynamiques.
- `/api/track-download` → incrémente `resources.downloads`.
- `/api/ai-draft` (option) → génère un brouillon d’article.
 - `/api/monitoring` → lance un cycle de veille (LinkedIn public URLs, RSS, site via sitemap) et retourne les stats.
 - `/api/admin/seed-test-user` → crée un utilisateur de test Supabase (protégé par `ADMIN_SEED_TOKEN`).

Variables d’env (Vercel):
```
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (server only)
ADMIN_SEED_TOKEN (server only)
RESEND_API_KEY (ou SMTP_*)
SITE_URL (prod), STAGING_URL (préprod)
```

### Squelettes d’API (extraits)
```ts
// /api/robots.ts
export const config = { runtime: 'edge' };
export default async () => new Response(
  `User-agent: *\nAllow: /\nSitemap: ${process.env.SITE_URL}/sitemap.xml\n`,
  { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } }
);

// /api/sitemap.ts (index ou ?type=articles|resources)
// 1) fetch slugs where published=true 2) émettre XML; 3) s-maxage=21600

// /api/contact.ts (POST)
// validate payload → insert into public.messages → send email via Resend → return 204

// /api/track-download.ts
// update public.resources set downloads = downloads + 1 where id = $id
```

### Admin `/admin`
- Auth Supabase (email+password / magic link).
- Vues: Articles, Ressources, Nouveau/Éditer.
- Upload vers Storage, **slug auto** (kebab‑case + vérif unicité), switch `published`.
- Bouton « Générer un brouillon IA » (appelle `/api/ai-draft`).

Ajouts réalisés (v1)
- Layout admin: topbar + sidebar + sous-routes `/admin`, `/admin/content`, `/admin/agents`, `/admin/approvals`, `/admin/analytics`, `/admin/seo`.
- Content Studio:
  - Panneau Agents IA (liste + ajout), Templates, Visual Generator (napkin/bar/line → insertion Markdown).
  - Éditeur Markdown + Aperçu + Score SEO (titre, méta, keywords, longueur).
  - WorkflowCanvas (drag, connexions, exécution IA, badges d’état, export JSON, reset) synchronisé avec DB locale.
  - Génération IA: bouton et workflow → remplit automatiquement titre/méta/draft.
- AI Agents: gestion (création/édition/suppression) stockée en localStorage.
- Approvals (CEO): liste `pending`, actions Approuver/Refuser. Approuver ⇒ publication + enregistrement de métriques (automation).
- Analytics (Hub v1): graphs placeholders (traffic sources, time on page) prêt à brancher Plausible/GA4.
- Dashboard v1: KPIs, trafic 14j, top contenus, listes récentes.

Veille connectée (v1)
- Onglet `Veille`: bouton « Lancer Veille ». Stocke dans `data/monitoring/` et calcule un index global. Dédup par URL. Top auteurs/sources agrégés.

Synchronisation locale
- `AdminDataContext` (localStorage) expose 3 collections:
  - `research` (veille/insights),
  - `content` (posts: draft → pending → approved → published),
  - `performance` (métriques post‑publication).
- Le workflow lit/écrit ces données et enchaîne les 8 étapes automatiquement.

### IA & Agents (MVP soft)
- Entrées: sujet + 3 sources (URLs ou SERP résumée).
- Sorties: plan H2/H3 + intro + FAQ SEO; statut: brouillon (non publié).

---

## 7) SEO — exigences
- `robots.txt` à la racine, pointant vers le sitemap.
- **Sitemaps dynamiques** (index + types), cache 6h.
- **JSON‑LD** par page:
  - `Organization`, `Person` (Accueil)
  - `BreadcrumbList` (pages détail)
  - `BlogPosting` (articles), `CreativeWork` (ressources)
- Balises: `<title>`, `<meta name="description">`, canonical, OpenGraph/Twitter.
- Interlinking: articles/ressources liés par tags.
- Stratégie: clusters thématiques & longue traîne; priorité qualité/E‑E‑A‑T.

Exemples JSON‑LD (injection `<script type="application/ld+json">`):
```json
{ "@context": "https://schema.org", "@type": "Organization", "name": "Ton Nom / Marque", "url": "https://ton-domaine", "logo": "https://ton-domaine/logo.png" }
```
```json
{ "@context": "https://schema.org", "@type": "BlogPosting", "headline": "Titre", "datePublished": "2025-01-01", "author": {"@type":"Person","name":"Toi"}, "image": "https://.../cover.jpg", "mainEntityOfPage": "https://ton-domaine/blog/slug" }
```

---

## 8) Non‑fonctionnel
- Performance: **LCP < 2.5s**, images optimisées, lazy‑loading.
- Accessibilité: contrastes, aria‑labels, focus visible.
- RGPD: bannière cookies (si analytics/ads), page Politique Confidentialité.

---

## Guideline de réalisation (step‑by‑step)

### Étape 1 — Fondations & sécurité (½ j)
- Durcir RLS (policies propriétaire sur `author_id`).
- Créer buckets Storage + règles d’accès.
- Variables d’env Vercel (Supabase, Resend/SMTP).

### Étape 2 — Pages publiques (1–2 j)
- `/bibliotheque`: grille filtrable (Search, filtres `category` + `tags`, tri Populaires/Récents), pagination.
- `/blog`: liste avec Search/tags/tri/pagination.
- `/resource/:slug` & `/blog/:slug`: page détail + contenus liés.
Composants: `ResourceCard`, `FiltersBar`, `Pagination`, `Breadcrumbs`, `ArticleCard`, `TagChip`.

Routes additionnelles
- `/resource/templates-dashboard-phrama` → page embarquée (`PharmaEmbedPage`) affichant une démo externe (Vercel) sous le header.

### Étape 3 — Admin (1–2 j)
- `/admin` + login Supabase.
- CRUD Articles/Ressources, upload, slug auto, toggle `published`, bouton « Générer un brouillon IA ».

### Étape 4 — API Vercel (1 j)
- `/api/robots.ts`, `/api/sitemap.ts`, `/api/contact.ts` (+ `/api/track-download.ts`).

IA Draft & Chat (serveur)
- `/api/ai-draft`: génère `strategist` (angles, mots‑clés, briefs) + `ghostwriter` (blog SEO + draft_md).
- `/api/ai-proxy`: proxy serveur vers OpenAI/Anthropic/Google/Mistral/Perplexity (clés non exposées côté client).

Exemple robots minimal:
```
User-agent: *
Allow: /
Sitemap: https://ton-domaine/sitemap.xml
```

### Étape 5 — SEO & métadonnées (½–1 j)
- Hook `<Helmet>` (ou util perso) pour Title/Description/Canonical.
- JSON‑LD par page, liens internes automatiques par tags, OpenGraph.

### Étape 6 — Analytics & conversion (½ j)
- Plausible / Umami / GA4.
- Événements: `download_resource`, `contact_submit`.
- Page remerciement avec UTM.

### Étape 7 — IA / Agents (1–2 j MVP)
- `/api/ai-draft`: sujet → plan + intro + sections → enregistre en brouillon.
- Cron hebdo (phase 2) `/api/weekly-ideas` pour stocker table `ideas` et envoyer un récap.

### Étape 8 — Qualif & déploiement (½ j)
- Tests manuels (navigation, filtres, upload, RLS).
- Vercel: vérifier `/robots.txt`, `/sitemap.xml`.
- GSC: soumettre sitemap + demande d’indexation.

### Jalons
- J1: RLS + pages `/bibliotheque` & `/blog` (listes)
- J2: Détails + SEO de base
- J3: Admin CRUD + upload
- J4: API robots/sitemaps/contact + analytics
- J5: IA brouillon + QA final + GSC

---

## Composants à livrer (front)
`ResourceCard`, `ArticleCard`, `FiltersBar`, `SearchInput`, `TagChip`, `Pagination`, `Breadcrumbs`, `MarkdownRenderer`, `AdminEditor` (textarea markdown + toolbar), `AuthGuard`.

## Fonctions côté Vercel /api (TS)
- `robots.ts`: renvoie `text/plain`.
- `sitemap.ts`: `?type=articles|resources` → XML, sinon index listant les 2; fetch Supabase `slug, updated_at` where `published=true` order by `updated_at desc` limit 5000; header `s-maxage=21600`.
- `contact.ts`: vérif champs, insert `messages`, email Resend, `204`.
- `ai-draft.ts` (option): résume sources, propose plan H2/H3 + méta title/description (ne publie pas).

## Contenu initial “Bibliothèque” (exemples)
- Template dashboard Pharma (category: 'Pharma')
- Template dashboard Marketing (category: 'Marketing')
- Template dashboard Sales (category: 'Sales')
Tags communs: `['Power BI','DAX','Template']` — fichier ZIP/PDF dans Storage + `slug` propre.

## Analytics — exemples d’événements
```ts
// Plausible / Umami (ex.)
plausible('download_resource', { props: { id, slug, category } });
plausible('contact_submit');
```

---

## Notes d’implémentation
- Utiliser `react-router-dom` pour les routes citées en Front (SPA) et hydrater les métadonnées via un util commun (Helmet ou équivalent).
- Liaison téléchargements: bouton appelle `/api/track-download?id=...` puis redirige vers l’URL signée du fichier.
- Pour Storage privé: générer une URL signée côté serveur pour 5–10 min.

## Environnements & variables
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (facultatifs en local)
- `SUPABASE_SERVICE_ROLE_KEY` (server‑only)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `MISTRAL_API_KEY`, `PERPLEXITY_API_KEY` (server‑only)
- `RESEND_API_KEY` (optionnel)
- `SITE_URL`
- `VITE_PLAUSIBLE_DOMAIN`
- `VITE_PHARMA_DEMO_URL`

## Vision à moyen terme
- **Workflows IA no‑code**: éditeur enrichi (drag lines, zoom, palettes d’agents), orchestrations parallèles, logs.
- **Content/Sales automatisé**: l’utilisateur ne fait que **valider** (Lead/CEO). Le reste (veille → rédaction → publication → tracking → feedback) est orchestré et historisé.

---

## Guide d’utilisation (How‑to)

1) Se connecter
- Bouton « Se connecter » (header) → `/login`.
- En local sans Supabase: email `test@test.com`, mot de passe `1234test`.

2) Créer/configurer des agents IA
- Aller sur `/admin/agents`.
- « Créer / Modifier »: saisir Nom, Rôle, Prompt; cliquer « Créer ».
- Les agents sont sauvegardés en local (localStorage) et repris par le panneau « Agents IA » du Content Studio.

3) Lancer un workflow (type n8n/Make)
- Aller sur `/admin/content`.
- En haut: saisir un Topic (ex: « Reporting Power BI Finance »).
- Cliquer « Exécuter »:
  - Topic/Research → crée une entrée `research` (veille).
  - Strategist/Ghostwriter → appelle `/api/ai-draft` et crée un `content` en `draft`.
  - Lead (Content Lead) → passe `draft` → `pending`.
  - Community → publication (si approuvé) et création d’une entrée `performance`.
- Les nœuds affichent leur statut (En attente / En cours / Terminé) et le JSON du graphe peut être copié.

4) Générer un brouillon IA (manuel)
- Dans « Générateur d’articles IA », saisir le sujet → « Générer brouillon IA ».
- Le formulaire d’édition est pré‑rempli (titre SEO, méta, markdown).

5) Approver / Publier
- Aller sur `/admin/approvals`.
- Vérifier le contenu `pending` → « Approuver ».
- Automation v1: `approved` → `published` + enregistrement de métriques `performance` (views/engagement).

6) Optimiser SEO
- Panneau « SEO Score » (droite): vérifie longueur du titre/méta, présence de keywords, longueur du contenu.
- Ajuster titre/méta/markdown jusqu’à un score satisfaisant.

7) Suivre la performance
- Aller sur `/admin/analytics` (trafic par source, temps moyen) et `/admin` (KPIs, top contenus, listes récentes).
- Brancher Plausible/GA4 via `VITE_PLAUSIBLE_DOMAIN` pour remplacer les placeholders.

8) Démo Pharma
- La carte « Template dashboard Pharma » mène directement à `/resource/templates-dashboard-phrama` qui embarque une démo externe.
- Définir `VITE_PHARMA_DEMO_URL` (ex: `https://votre-demo.vercel.app`).

9) Activer l’IA « réelle » (option)
- Ajouter `OPENAI_API_KEY` côté serveur (Vercel). Mettre à jour `/api/ai-draft` pour appeler OpenAI.
- Garder le Service Role Supabase si vous souhaitez enregistrer les brouillons en base.


