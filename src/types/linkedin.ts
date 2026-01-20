/**
 * LinkedIn Agent Multi-Agent System Types
 *
 * Types pour le système d'automatisation LinkedIn avec 3 agents IA:
 * - Claude Sonnet 4.5
 * - GPT-4o
 * - Gemini 2.0 Flash
 */

export interface LinkedInPost {
  id: string;
  post_url: string;
  author_name: string;
  author_headline?: string;
  author_avatar_url?: string;
  content: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  relevance_score: number;
  category?: string;
  status: 'new' | 'to_engage' | 'engaged' | 'skipped';
  is_lead_opportunity: boolean;
  lead_priority?: 'high' | 'medium' | 'low';
  lead_reasoning?: string;
  suggested_comment?: string;
  agents_responses?: AgentsResponses;
  selected_agent?: 'claude' | 'gpt4o' | 'gemini';
  user_edited_comment?: string;
  comment_status?: 'pending' | 'edited' | 'posted' | 'skipped';
  created_at: string;
  updated_at?: string;
}

export interface AgentsResponses {
  claude?: AgentResponse;
  gpt4o?: AgentResponse;
  gemini?: AgentResponse;
}

export interface AgentResponse {
  relevance_score: number;
  suggested_comment: string;
  analysis?: string;
  is_lead_opportunity: boolean;
  lead_priority?: 'high' | 'medium' | 'low';
  lead_reasoning?: string;
  keywords?: string[];
  response_time_ms?: number;
  status: 'success' | 'error';
  error_message?: string;
}

export interface PostFilters {
  status: 'all' | 'new' | 'to_engage' | 'engaged' | 'skipped';
  category: string;
  minScore?: number;
  leadPriority?: 'high' | 'medium' | 'low';
}

export interface DashboardStats {
  postsToProcess: number;
  commentsToday: number;
  leadsThisMonth: number;
  scrapingProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  aiAnalysisProgress: {
    claude: 'idle' | 'processing' | 'done' | 'error';
    gpt4o: 'idle' | 'processing' | 'done' | 'error';
    gemini: 'idle' | 'processing' | 'done' | 'error';
  };
  hotOpportunities: HotOpportunity[];
  agentPerformance: {
    claude: AgentPerformance;
    gpt4o: AgentPerformance;
    gemini: AgentPerformance;
  };
  costs: {
    total: number;
    uptime: number;
  };
}

export interface HotOpportunity {
  id: string;
  authorName: string;
  authorTitle: string;
  score: number;
  leadPriority: 'high' | 'medium' | 'low';
}

export interface AgentPerformance {
  selectedRate: number;
  avgResponseTime: number;
}

export type AgentName = 'claude' | 'gpt4o' | 'gemini';

export interface AgentConfig {
  name: AgentName;
  emoji: string;
  label: string;
  model: string;
  color: string;
}

export const AGENT_CONFIGS: Record<AgentName, AgentConfig> = {
  claude: {
    name: 'claude',
    emoji: '🧠',
    label: 'Claude Sonnet 4.5',
    model: 'claude-sonnet-4-5-20250929',
    color: 'purple'
  },
  gpt4o: {
    name: 'gpt4o',
    emoji: '🤖',
    label: 'GPT-4o',
    model: 'gpt-4o',
    color: 'green'
  },
  gemini: {
    name: 'gemini',
    emoji: '🌟',
    label: 'Gemini 2.0 Flash',
    model: 'gemini-2.0-flash-exp',
    color: 'blue'
  }
};
