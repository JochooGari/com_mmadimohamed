// Types communs pour l'application MagicPath

export interface ContentSource {
  id: string;
  name: string;
  type: 'document' | 'transcript' | 'url';
  status: 'processing' | 'ready' | 'error';
  tags: string[];
  lastUpdated: string;
  content?: string;
  extractedData?: {
    wordCount?: number;
    lineCount?: number;
    size?: number;
    language?: 'fr' | 'en';
    type?: string;
    processedAt?: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  type: 'linkedin' | 'geo';
  config: Record<string, any>;
  lastUpdated: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'linkedin' | 'geo';
  status: 'draft' | 'active' | 'paused' | 'completed';
  config: Record<string, any>;
  createdAt: string;
}

export interface TestResult {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  metrics: {
    responseTime: number;
    tokenCount: number;
    cost: number;
    quality: number;
  };
  score: number;
  feedback: string;
}