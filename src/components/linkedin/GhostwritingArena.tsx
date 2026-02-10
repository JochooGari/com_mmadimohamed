import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LinkedInPost, AgentName, AgentResponse } from '@/types/linkedin';
import { AGENT_CONFIGS } from '@/types/linkedin';

interface GhostwritingArenaProps {
  post?: LinkedInPost;
  onPublish?: (text: string, agentUsed: string) => void;
}

interface AgentDraft {
  agentName: AgentName;
  label: string;
  color: string;
  score: number;
  tone: string;
  charCount: number;
  sections: {
    intro: string;
    body: string;
    outro: string;
  };
}

interface FusionSelection {
  hook: AgentName;
  argument: AgentName;
  cta: AgentName;
}

// Fonction utilitaire pour diviser un texte en sections
function splitIntoSections(text: string): { intro: string; body: string; outro: string } {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const total = sentences.length;

  if (total <= 2) {
    return { intro: text, body: '', outro: '' };
  }

  const introEnd = Math.ceil(total * 0.25);
  const bodyEnd = Math.ceil(total * 0.75);

  return {
    intro: sentences.slice(0, introEnd).join(' '),
    body: sentences.slice(introEnd, bodyEnd).join(' '),
    outro: sentences.slice(bodyEnd).join(' ')
  };
}

// Données mock pour démo
const mockDrafts: AgentDraft[] = [
  {
    agentName: 'claude',
    label: 'Claude 3.5 Sonnet',
    color: 'purple',
    score: 9.2,
    tone: 'Pro',
    charCount: 840,
    sections: {
      intro: "Remote work isn't just a perk anymore; it's the new baseline for high-performing SaaS sales organizations.",
      body: "We've seen a 40% increase in productivity when Account Executives are given autonomy over their environment. The challenge isn't \"presence\", it's \"alignment\". Tools like Gong and Slack have replaced the bullpen, but culture is what replaces the manager looking over your shoulder.",
      outro: "Are you still measuring hours in seat, or are you measuring outcomes? The future belongs to the asynchronous closers."
    }
  },
  {
    agentName: 'gpt4o',
    label: 'GPT-4o',
    color: 'teal',
    score: 8.8,
    tone: 'Warm',
    charCount: 620,
    sections: {
      intro: "The SaaS sales world has fundamentally changed. Remote-first isn't a trend, it's the new reality.",
      body: "What matters now is output, not office presence. Teams that embrace async communication and trust-based management consistently outperform those clinging to traditional models.",
      outro: "What's your take on remote sales teams? Drop your experience below!"
    }
  },
  {
    agentName: 'gemini',
    label: 'Gemini 1.5 Pro',
    color: 'blue',
    score: 7.5,
    tone: 'Tech',
    charCount: 910,
    sections: {
      intro: "Data from 500+ SaaS companies reveals a surprising insight about remote sales performance.",
      body: "The correlation between physical office presence and deal closure rates is actually negative in enterprise sales. Why? Top performers leverage async tools to prepare better, research deeper, and personalize more effectively. The old \"war room\" mentality is being replaced by strategic, focused selling.",
      outro: "Curious to see how your team stacks up. What metrics are you tracking for remote effectiveness?"
    }
  }
];

const mockPost: Partial<LinkedInPost> = {
  author_name: 'Alex Morgan',
  author_headline: 'VP Sales @ TechCorp | B2B SaaS',
  author_avatar_url: '',
  content: 'Just wrapped up Q4 with our fully remote sales team hitting 127% of quota. The \"you need butts in seats\" crowd was wrong. Here\'s what actually moves the needle in remote SaaS sales...',
};

// Composant pour une section de texte
const SectionBlock: React.FC<{
  label: string;
  content: string;
  color: 'orange' | 'gray' | 'teal';
}> = ({ label, content, color }) => {
  const colorClasses = {
    orange: 'border-l-orange-500 bg-orange-50/50',
    gray: 'border-l-gray-300 bg-gray-50/50',
    teal: 'border-l-teal-500 bg-teal-50/50'
  };

  return (
    <div className={`border-l-4 ${colorClasses[color]} pl-3 py-2 rounded-r`}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{content}</p>
    </div>
  );
};

// Composant pour une colonne d'agent
const AgentColumn: React.FC<{
  draft: AgentDraft;
  isSelected: boolean;
  isBestScore: boolean;
  onChoose: () => void;
}> = ({ draft, isSelected, isBestScore, onChoose }) => {
  const agentConfig = AGENT_CONFIGS[draft.agentName];

  return (
    <div className={`rounded-xl border-2 p-5 transition-all ${
      isSelected
        ? 'border-teal-500 bg-teal-50/30 shadow-lg'
        : isBestScore
          ? 'border-green-400 bg-green-50/20'
          : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
            draft.agentName === 'claude' ? 'bg-purple-100' :
            draft.agentName === 'gpt4o' ? 'bg-teal-100' :
            'bg-blue-100'
          }`}>
            {agentConfig.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900">{draft.label}</h4>
              {isBestScore && (
                <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5">TOP</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold text-gray-700">{draft.score.toFixed(1)}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{draft.tone}</Badge>
              <span className="text-xs text-gray-400">{draft.charCount} chars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <SectionBlock label="INTRO" content={draft.sections.intro} color="orange" />
        <SectionBlock label="BODY" content={draft.sections.body} color="gray" />
        <SectionBlock label="OUTRO" content={draft.sections.outro} color="gray" />
      </div>

      {/* Choose Button */}
      <Button
        onClick={onChoose}
        className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${
          isSelected
            ? 'bg-teal-500 hover:bg-teal-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <span className={`mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`}>●</span>
        Choose {draft.label.split(' ')[0]}
      </Button>
    </div>
  );
};

// Composant pour une ligne de sélection Fusion
const FusionRow: React.FC<{
  label: string;
  selected: AgentName;
  onSelect: (agent: AgentName) => void;
  drafts: AgentDraft[];
}> = ({ label, selected, onSelect, drafts }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-gray-500 w-48 shrink-0">{label}</span>
      <div className="flex gap-2 flex-1">
        {drafts.map((draft) => {
          const config = AGENT_CONFIGS[draft.agentName];
          const isActive = selected === draft.agentName;
          return (
            <button
              key={draft.agentName}
              onClick={() => onSelect(draft.agentName)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{config.emoji}</span>
              <span>{draft.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function GhostwritingArena({ post, onPublish }: GhostwritingArenaProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null);
  const [fusion, setFusion] = useState<FusionSelection>({
    hook: 'claude',
    argument: 'gpt4o',
    cta: 'gemini'
  });
  const [showFusionMode, setShowFusionMode] = useState(true);

  // States pour la zone de contexte LinkedIn
  const [contextInput, setContextInput] = useState<string>('');
  const [contextImage, setContextImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComments, setGeneratedComments] = useState<{
    claude: string;
    gpt4o: string;
    gemini: string;
  } | null>(null);

  // Convertir les données du post en drafts ou utiliser les mock
  const drafts = useMemo<AgentDraft[]>(() => {
    if (post?.agents_responses) {
      const results: AgentDraft[] = [];
      const agents: AgentName[] = ['claude', 'gpt4o', 'gemini'];

      agents.forEach((agentName) => {
        const response = post.agents_responses?.[agentName];
        if (response?.status === 'success' && response.suggested_comment) {
          const sections = splitIntoSections(response.suggested_comment);
          const config = AGENT_CONFIGS[agentName];

          results.push({
            agentName,
            label: config.label,
            color: config.color,
            score: response.relevance_score || 0,
            tone: response.lead_priority === 'high' ? 'Pro' :
                  response.lead_priority === 'medium' ? 'Warm' : 'Tech',
            charCount: response.suggested_comment.length,
            sections
          });
        }
      });

      return results.length > 0 ? results : mockDrafts;
    }
    return mockDrafts;
  }, [post]);

  // Post source (réel ou mock)
  const sourcePost = post || mockPost;

  // Trouver le meilleur score
  const bestScore = Math.max(...drafts.map(d => d.score));

  // Calculer le texte fusionné
  const fusedText = useMemo(() => {
    const hookDraft = drafts.find(d => d.agentName === fusion.hook);
    const argDraft = drafts.find(d => d.agentName === fusion.argument);
    const ctaDraft = drafts.find(d => d.agentName === fusion.cta);

    return {
      hook: hookDraft?.sections.intro || '',
      argument: argDraft?.sections.body || '',
      cta: ctaDraft?.sections.outro || ''
    };
  }, [drafts, fusion]);

  // Calculer le score remix (moyenne pondérée)
  const remixScore = useMemo(() => {
    const hookDraft = drafts.find(d => d.agentName === fusion.hook);
    const argDraft = drafts.find(d => d.agentName === fusion.argument);
    const ctaDraft = drafts.find(d => d.agentName === fusion.cta);

    const hookScore = hookDraft?.score || 0;
    const argScore = argDraft?.score || 0;
    const ctaScore = ctaDraft?.score || 0;

    // Pondération: Body (50%), Intro (30%), Outro (20%)
    return ((hookScore * 0.3) + (argScore * 0.5) + (ctaScore * 0.2)).toFixed(1);
  }, [drafts, fusion]);

  const handlePublishRemix = () => {
    const fullText = `${fusedText.hook}\n\n${fusedText.argument}\n\n${fusedText.cta}`;
    onPublish?.(fullText, `fusion-${fusion.hook}-${fusion.argument}-${fusion.cta}`);
    navigator.clipboard.writeText(fullText);
  };

  const handleChooseAgent = (agentName: AgentName) => {
    setSelectedAgent(agentName);
    const draft = drafts.find(d => d.agentName === agentName);
    if (draft) {
      const fullText = `${draft.sections.intro}\n\n${draft.sections.body}\n\n${draft.sections.outro}`;
      onPublish?.(fullText, agentName);
      navigator.clipboard.writeText(fullText);
    }
  };

  const resetMixer = () => {
    setFusion({
      hook: 'claude',
      argument: 'gpt4o',
      cta: 'gemini'
    });
  };

  // Fonction pour générer des commentaires à partir du contexte
  const generateCommentsFromContext = async () => {
    if (!contextInput.trim() && !contextImage) return;

    setIsGenerating(true);
    setGeneratedComments(null);

    const prompt = `Tu es un expert LinkedIn. Voici un post LinkedIn:

${contextInput}

Génère un commentaire professionnel et engageant pour ce post. Le commentaire doit:
- Apporter de la valeur ajoutée
- Montrer ton expertise
- Être authentique et pas trop promotionnel
- Faire entre 50 et 150 mots

Réponds uniquement avec le commentaire, sans introduction ni explication.`;

    try {
      // Appeler les 3 IA en parallèle
      const [claudeRes, gptRes, geminiRes] = await Promise.all([
        fetch('/api/n8n/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: 'test-agent',
            data: { messages: [{ role: 'user', content: prompt }] },
            config: { provider: 'anthropic', model: 'claude-sonnet-4-5-20250514', temperature: 0.7, maxTokens: 500 }
          })
        }),
        fetch('/api/n8n/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: 'test-agent',
            data: { messages: [{ role: 'user', content: prompt }] },
            config: { provider: 'openai', model: 'gpt-5.2', temperature: 0.7, maxTokens: 500 }
          })
        }),
        fetch('/api/n8n/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: 'test-agent',
            data: { messages: [{ role: 'user', content: prompt }] },
            config: { provider: 'google', model: 'gemini-2.5-pro', temperature: 0.7, maxTokens: 500 }
          })
        })
      ]);

      const [claudeData, gptData, geminiData] = await Promise.all([
        claudeRes.json(),
        gptRes.json(),
        geminiRes.json()
      ]);

      setGeneratedComments({
        claude: claudeData?.output?.text || 'Erreur de génération',
        gpt4o: gptData?.output?.text || 'Erreur de génération',
        gemini: geminiData?.output?.text || 'Erreur de génération'
      });
    } catch (error) {
      console.error('Erreur génération commentaires:', error);
      setGeneratedComments({
        claude: 'Erreur de connexion',
        gpt4o: 'Erreur de connexion',
        gemini: 'Erreur de connexion'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Réinitialiser le contexte
  const clearContext = () => {
    setContextInput('');
    setContextImage(null);
    setGeneratedComments(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header avec Source Context */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#127942;</span>
            <h2 className="text-xl font-bold text-gray-900">Agent Arena: Ghostwriting LinkedIn</h2>
            <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Mode
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-10">
            Compare generated comments from 3 AI agents
          </p>
        </div>

        {/* Source Context Card - En haut à droite */}
        <div className="w-80 shrink-0 bg-rose-50 rounded-xl p-4 border border-rose-100">
          <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-3">
            SOURCE CONTEXT
          </h4>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {sourcePost.author_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">
                {sourcePost.author_name || 'Unknown Author'} <span className="font-normal text-gray-400">• 1st</span>
              </p>
              <p className="text-[10px] text-gray-500 truncate">{sourcePost.author_headline || ''}</p>
              <p className="text-xs text-gray-600 line-clamp-3 mt-2 leading-relaxed">
                {sourcePost.content || 'No content available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de contexte LinkedIn */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">&#128221;</span>
            <h3 className="font-bold text-gray-900">Contexte LinkedIn</h3>
            <span className="text-xs text-gray-400">Collez un post ou une capture d'écran LinkedIn pour générer des commentaires</span>
          </div>
          {(contextInput || contextImage) && (
            <button onClick={clearContext} className="text-sm text-gray-500 hover:text-red-500">
              Effacer
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Textarea pour le texte du post */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Post LinkedIn (texte)</label>
            <textarea
              className="w-full min-h-[150px] p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Collez le contenu du post LinkedIn ici..."
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
            />
          </div>

          {/* Zone d'upload image */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Capture d'écran (optionnel)</label>
            <div
              className="w-full min-h-[150px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => document.getElementById('linkedin-screenshot')?.click()}
            >
              {contextImage ? (
                <div className="relative w-full h-full p-2">
                  <img src={contextImage} alt="Screenshot" className="max-h-[140px] mx-auto object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setContextImage(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    &#10005;
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <span className="text-3xl">&#128247;</span>
                  <p className="text-sm mt-2">Cliquez pour uploader une capture</p>
                </div>
              )}
            </div>
            <input
              id="linkedin-screenshot"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setContextImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled={(!contextInput.trim() && !contextImage) || isGenerating}
            onClick={generateCommentsFromContext}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">&#9696;</span>
                Génération en cours...
              </>
            ) : (
              <>
                <span>&#128640;</span>
                Générer les commentaires
              </>
            )}
          </Button>
          {generatedComments && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              &#10003; Commentaires générés
            </Badge>
          )}
        </div>

        {/* Affichage des commentaires générés */}
        {generatedComments && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Claude */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">&#129302;</span>
                <span className="font-bold text-purple-800">Claude</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedComments.claude)}
                  className="ml-auto text-xs text-purple-600 hover:text-purple-800"
                >
                  Copier
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedComments.claude}</p>
            </div>

            {/* GPT-4o */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">&#129504;</span>
                <span className="font-bold text-teal-800">GPT-5</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedComments.gpt4o)}
                  className="ml-auto text-xs text-teal-600 hover:text-teal-800"
                >
                  Copier
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedComments.gpt4o}</p>
            </div>

            {/* Gemini */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">&#128142;</span>
                <span className="font-bold text-blue-800">Gemini</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedComments.gemini)}
                  className="ml-auto text-xs text-blue-600 hover:text-blue-800"
                >
                  Copier
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedComments.gemini}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3 Agent Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {drafts.map((draft) => (
          <AgentColumn
            key={draft.agentName}
            draft={draft}
            isSelected={selectedAgent === draft.agentName}
            isBestScore={draft.score === bestScore}
            onChoose={() => handleChooseAgent(draft.agentName)}
          />
        ))}
      </div>

      {/* AI Fusion Mode */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">&#129516;</span>
            <h3 className="font-bold text-gray-900">AI Fusion Mode</h3>
            <span className="text-xs text-gray-400">Mix and match best parts from each agent</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetMixer}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Reset Mixer
            </button>
            <button
              onClick={() => setShowFusionMode(!showFusionMode)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showFusionMode ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {showFusionMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selection Panel */}
            <div className="space-y-4">
              <FusionRow
                label="1. SELECT HOOK (INTRO)"
                selected={fusion.hook}
                onSelect={(agent) => setFusion(prev => ({ ...prev, hook: agent }))}
                drafts={drafts}
              />
              <FusionRow
                label="2. SELECT ARGUMENT (BODY)"
                selected={fusion.argument}
                onSelect={(agent) => setFusion(prev => ({ ...prev, argument: agent }))}
                drafts={drafts}
              />
              <FusionRow
                label="3. SELECT CTA (CONCLUSION)"
                selected={fusion.cta}
                onSelect={(agent) => setFusion(prev => ({ ...prev, cta: agent }))}
                drafts={drafts}
              />
            </div>

            {/* Live Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                LIVE PREVIEW
              </h4>
              <div className="space-y-3 text-sm">
                <p className="text-gray-900 font-medium">{fusedText.hook}</p>
                <p className="text-gray-700">{fusedText.argument}</p>
                <p className="text-teal-600">{fusedText.cta}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Remix Score: <strong className="text-gray-900">{remixScore}/10</strong>
                </span>
                <Button
                  onClick={handlePublishRemix}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold flex items-center gap-2"
                >
                  <span>&#10024;</span>
                  Publish Remix
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Agent Notification */}
      {selectedAgent && (
        <div className="fixed bottom-6 right-6 bg-teal-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <span className="text-xl">{AGENT_CONFIGS[selectedAgent].emoji}</span>
          <span className="font-medium">Comment copied from {AGENT_CONFIGS[selectedAgent].label}</span>
          <button
            onClick={() => setSelectedAgent(null)}
            className="ml-2 text-teal-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
