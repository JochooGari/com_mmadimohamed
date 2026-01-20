-- Migration: LinkedIn Posts Multi-Agent System
-- Created: 2025-01-20
-- Description: Table pour le système LinkedIn Agent avec support multi-agents (Claude, GPT-4o, Gemini)

-- Créer la table linkedin_posts si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations du post LinkedIn
  post_url TEXT NOT NULL UNIQUE,
  author_name TEXT NOT NULL,
  author_headline TEXT,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,

  -- Scoring et catégorisation
  relevance_score INTEGER NOT NULL DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 10),
  category TEXT,

  -- Statut du post
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'to_engage', 'engaged', 'skipped')),

  -- Lead opportunity
  is_lead_opportunity BOOLEAN DEFAULT FALSE,
  lead_priority TEXT CHECK (lead_priority IN ('high', 'medium', 'low')),
  lead_reasoning TEXT,

  -- Commentaire suggéré (meilleur des 3 agents)
  suggested_comment TEXT,

  -- Réponses des 3 agents IA (JSONB)
  agents_responses JSONB DEFAULT '{}'::jsonb,

  -- Agent sélectionné
  selected_agent TEXT CHECK (selected_agent IN ('claude', 'gpt4o', 'gemini')),

  -- Commentaire édité par l'utilisateur
  user_edited_comment TEXT,

  -- Statut du commentaire
  comment_status TEXT DEFAULT 'pending' CHECK (comment_status IN ('pending', 'edited', 'posted', 'skipped')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON public.linkedin_posts(status);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_relevance_score ON public.linkedin_posts(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_is_lead ON public.linkedin_posts(is_lead_opportunity, lead_priority);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON public.linkedin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_category ON public.linkedin_posts(category);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_selected_agent ON public.linkedin_posts(selected_agent);

-- Index JSONB pour interroger les réponses des agents
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_agents_responses ON public.linkedin_posts USING GIN (agents_responses);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_linkedin_posts_updated_at
  BEFORE UPDATE ON public.linkedin_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

-- Politique: Lecture publique pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read posts"
  ON public.linkedin_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique: Insertion pour service role uniquement (n8n webhooks)
CREATE POLICY "Allow service role to insert posts"
  ON public.linkedin_posts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Politique: Mise à jour pour utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to update posts"
  ON public.linkedin_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.linkedin_posts IS 'Posts LinkedIn analysés par le système multi-agents (Claude, GPT-4o, Gemini)';
COMMENT ON COLUMN public.linkedin_posts.agents_responses IS 'Réponses des 3 agents IA au format JSONB: { "claude": {...}, "gpt4o": {...}, "gemini": {...} }';
COMMENT ON COLUMN public.linkedin_posts.selected_agent IS 'Agent sélectionné par le système de vote majoritaire';
COMMENT ON COLUMN public.linkedin_posts.relevance_score IS 'Score moyen des 3 agents (0-10)';
COMMENT ON COLUMN public.linkedin_posts.is_lead_opportunity IS 'Décision majoritaire (2 sur 3 minimum) des agents';

-- Exemple de structure JSONB pour agents_responses:
-- {
--   "claude": {
--     "relevance_score": 9,
--     "suggested_comment": "Super contenu! ...",
--     "analysis": "Ce post aborde...",
--     "is_lead_opportunity": true,
--     "lead_priority": "high",
--     "lead_reasoning": "Profile CFO d'une entreprise 50-200 employés",
--     "keywords": ["power bi", "finance", "dax"],
--     "response_time_ms": 1250,
--     "status": "success"
--   },
--   "gpt4o": { ... },
--   "gemini": { ... }
-- }
