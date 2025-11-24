/**
 * Store Zustand pour le système de scoring SEO/GEO
 * Basé sur PRD Section 4.6 - Gestion des états UI
 */

import { create } from 'zustand';
import { Editor } from '@tiptap/react';

// Types basés sur PRD Section 4.3
export type ScoringStatus = 'idle' | 'running_algo' | 'running_quick' | 'running_full' | 'success' | 'error';

export interface CriterionDetail {
  score: number;
  severity: 'ok' | 'warning' | 'critical';
  feedback: string;
}

export interface AlgorithmicResult {
  scores: {
    structure: number;
    keywordDensity: number;
    skimmability: number;
    readability: number;
    internalLinks: number;
    externalLinks: number;
    media: number;
    cta: number;
    publicationDate: number;
    temporalMentions: number;
    sourcesAge: number;
  };
  totalAlgo: number;
  details: CriterionDetail[];
}

export interface ScoreResult {
  scores: {
    global: number;
    seo: number;
    geo: number;
    freshness: number;
  };
  status: 'critical' | 'warning' | 'good' | 'excellent';
  statusColor: 'red' | 'orange' | 'yellow' | 'green';
  statusBadge: string;
  criteria: Record<string, CriterionDetail>;
  priorities: Array<{
    criterion: string;
    severity: 'critical' | 'warning';
    problem: string;
    action: string;
    location?: string;
  }>;
  freshnessPenalty: number;
  recommendations: {
    critical: string[];
    improvements: string[];
    strengths: string[];
  };
  summary: string;
  criteriaCounts: {
    ok: number;
    warning: number;
    critical: number;
  };
  isPartial: boolean;
  scoringVersion: string;
  llmModel: string;
  analyzedAt: string;
}

export interface ArticleConfig {
  primaryKeyword: string;
  articleType: 'guide' | 'comparatif' | 'tutoriel' | 'actualite' | 'liste' | 'etude-cas' | 'faq';
  searchIntent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  targetLength: number;
  secondaryKeywords?: string[];
  targetPersona?: string;
  competitorUrls?: string[];
  internalLinksPool?: string[];
  ctaObjective?: 'newsletter' | 'demo' | 'download' | 'contact';
  brandTone?: 'formal' | 'expert' | 'conversational' | 'pedagogical';
}

export interface UserProfile {
  industry: string;
  market: 'france' | 'france-eu' | 'international';
  userMode: 'standard' | 'pro';
}

interface ScoringStore {
  status: ScoringStatus;
  lastResult: ScoreResult | null;
  lastAnalyzedAt: Date | null;
  error: string | null;

  // Actions
  runAlgorithmicScoring: (editor: Editor, config: ArticleConfig) => Promise<void>;
  runQuickReview: (articleId: string, content: string, config: ArticleConfig, userProfile: UserProfile) => Promise<void>;
  runFullReview: (articleId: string, content: string, config: ArticleConfig, userProfile: UserProfile) => Promise<void>;
  reset: () => void;
}

// Webhook URL du workflow scoring
const SCORING_WEBHOOK_URL = 'https://n8n.srv1144760.hstgr.cloud/webhook/score-article';

export const useScoringStore = create<ScoringStore>((set, get) => ({
  status: 'idle',
  lastResult: null,
  lastAnalyzedAt: null,
  error: null,

  runAlgorithmicScoring: async (editor: Editor, config: ArticleConfig) => {
    set({ status: 'running_algo', error: null });

    try {
      // TODO: Implémenter le scoring algorithmique local (11 critères)
      // Pour l'instant, on fait un appel direct au webhook avec level='algo_only'

      const html = editor.getHTML();
      const text = editor.getText();

      console.log('📊 Running algorithmic scoring...', {
        wordCount: text.split(/\s+/).length,
        primaryKeyword: config.primaryKeyword
      });

      // Simulation pour MVP - remplacer par calculateAlgorithmicScores()
      const partialResult: ScoreResult = {
        scores: {
          global: 52,
          seo: 42,
          geo: 0,
          freshness: 5
        },
        status: 'warning',
        statusColor: 'orange',
        statusBadge: 'À améliorer',
        criteria: {},
        priorities: [],
        freshnessPenalty: 1.0,
        recommendations: {
          critical: [],
          improvements: ['Lancer une analyse IA complète pour le score final'],
          strengths: []
        },
        summary: 'Score partiel basé sur 11 critères algorithmiques. Lancez une analyse IA pour le score complet.',
        criteriaCounts: {
          ok: 7,
          warning: 3,
          critical: 1
        },
        isPartial: true,
        scoringVersion: 'v1.0',
        llmModel: 'algo-only',
        analyzedAt: new Date().toISOString()
      };

      set({
        status: 'success',
        lastResult: partialResult,
        lastAnalyzedAt: new Date()
      });
    } catch (e: any) {
      set({ status: 'error', error: e.message });
    }
  },

  runQuickReview: async (articleId: string, content: string, config: ArticleConfig, userProfile: UserProfile) => {
    set({ status: 'running_quick', error: null });

    try {
      const response = await fetch(SCORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          config,
          userProfile,
          level: 'quick'
        })
      });

      if (!response.ok) {
        throw new Error(`Scoring failed: ${response.statusText}`);
      }

      const result: ScoreResult = await response.json();
      result.isPartial = false;

      set({
        status: 'success',
        lastResult: result,
        lastAnalyzedAt: new Date()
      });
    } catch (e: any) {
      set({ status: 'error', error: e.message });
    }
  },

  runFullReview: async (articleId: string, content: string, config: ArticleConfig, userProfile: UserProfile) => {
    set({ status: 'running_full', error: null });

    try {
      const response = await fetch(SCORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          config,
          userProfile,
          level: 'full'
        })
      });

      if (!response.ok) {
        throw new Error(`Scoring failed: ${response.statusText}`);
      }

      const result: ScoreResult = await response.json();
      result.isPartial = false;

      console.log('✅ Full scoring completed:', {
        global: result.scores.global,
        status: result.statusBadge,
        criteriaCounts: result.criteriaCounts
      });

      set({
        status: 'success',
        lastResult: result,
        lastAnalyzedAt: new Date()
      });
    } catch (e: any) {
      console.error('❌ Scoring error:', e);
      set({ status: 'error', error: e.message });
    }
  },

  reset: () => {
    set({
      status: 'idle',
      lastResult: null,
      lastAnalyzedAt: null,
      error: null
    });
  }
}));
