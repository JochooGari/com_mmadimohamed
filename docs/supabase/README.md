# Supabase — Schéma & Mise en place

## Objectif
Fournir un schéma minimal viable (MVP) pour Articles/Ressources/Messages avec RLS durcie et instructions d’application sur Supabase (cloud).

## Schéma (DDL)
Le DDL est livré dans `supabase/migrations/20250919_init.sql` et couvre:
- Tables: `public.articles`, `public.resources`, `public.messages`
- Triggers `updated_at`
- RLS + Policies de base
- Index utiles

## Application du schéma

### Option A — Éditeur SQL (Dashboard Supabase)
1. Ouvrir votre projet Supabase → SQL → New query
2. Copier-coller le contenu de `supabase/migrations/20250919_init.sql`
3. Exécuter

### Option B — CLI (si disponible)
```bash
# Pré-requis: Supabase CLI installé et login effectué
cd magicpath-project
# Lier le projet (suivre l’invite pour sélectionner votre projet)
supabase link
# Pousser les migrations
supabase db push
```

## Variables d’environnement (Vercel)

```
# Client
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Serveur uniquement
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SEED_TOKEN=...

# Divers
SITE_URL=https://votre-domaine
```

## Utilisateur admin de test

Après déploiement, créer l’utilisateur de test via l’endpoint sécurisé:

```bash
curl -X POST "$SITE_URL/api/admin/seed-test-user" \
  -H "Content-Type: application/json" \
  -H "x-seed-token: $ADMIN_SEED_TOKEN" \
  -d '{"email":"test@test.com","password":"1234test"}'
```

Réponse attendue: `{ ok: true, created: true, userId: "..." }`.

## Notes
- Les pages publiques consomment `articles`/`resources` en lecture avec RLS autorisant les contenus publiés.
- Le formulaire `/api/contact` insère dans `messages` côté serveur (Service Role), lecture non publique.
- Ajustez/complétez le schéma selon vos besoins (tags, catégories, champs SEO supplémentaires, etc.).




