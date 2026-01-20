import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  Copy,
  Edit2,
  SkipForward,
  Clock,
  TrendingUp
} from 'lucide-react';
import type { LinkedInPost } from '@/types/linkedin';
import { toast } from 'sonner';

interface AgentArenaProps {
  post: LinkedInPost;
  onApprove: () => void;
  onSkip: () => void;
}

export function AgentArena({ post, onApprove, onSkip }: AgentArenaProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedComment, setEditedComment] = useState(post.suggested_comment || '');
  const [selectedTab, setSelectedTab] = useState(post.selected_agent || 'claude');

  const agents = post.agents_responses || {};

  const getAgentData = (agentName: string) => {
    return agents[agentName as keyof typeof agents];
  };

  const handleCopyToClipboard = async (comment: string) => {
    try {
      await navigator.clipboard.writeText(comment);
      toast.success('Commentaire copié dans le presse-papier!');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleSelectAgent = (agentName: string) => {
    setSelectedTab(agentName);
    const agentData = getAgentData(agentName);
    if (agentData) {
      setEditedComment(agentData.suggested_comment);
    }
  };

  const handleApprove = () => {
    handleCopyToClipboard(editedComment);
    onApprove();
  };

  const renderAgentCard = (agentName: string, emoji: string, label: string) => {
    const agent = getAgentData(agentName);

    if (!agent) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune réponse disponible
        </div>
      );
    }

    const isSelected = post.selected_agent === agentName;

    return (
      <div className="space-y-4">
        {/* Agent Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h3 className="font-semibold">{label}</h3>
              {agent.response_time_ms && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(agent.response_time_ms)}ms
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSelected && (
              <Badge variant="default" className="text-xs">
                🏆 Sélectionné
              </Badge>
            )}
            <Badge variant={agent.relevance_score >= 8 ? 'default' : 'secondary'}>
              {agent.relevance_score}/10
            </Badge>
          </div>
        </div>

        {/* Suggested Comment */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Commentaire suggéré:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(agent.suggested_comment)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">
            {agent.suggested_comment}
          </p>
        </Card>

        {/* Analysis */}
        {agent.analysis && (
          <Card className="p-4 bg-blue-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Analyse:</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {agent.analysis}
            </p>
          </Card>
        )}

        {/* Lead Analysis */}
        {agent.is_lead_opportunity && (
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-900">
                  🎯 Lead identifié ({agent.lead_priority})
                </h4>
                {agent.lead_reasoning && (
                  <p className="text-sm text-orange-700 mt-1">
                    {agent.lead_reasoning}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Keywords */}
        {agent.keywords && agent.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Mots-clés détectés:</h4>
            <div className="flex flex-wrap gap-2">
              {agent.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">
        🤖 Agent Arena - Comparez les 3 IA
      </h2>

      {/* Tabs for each agent */}
      <Tabs value={selectedTab} onValueChange={handleSelectAgent} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claude" disabled={!agents.claude}>
            🧠 Claude
            {agents.claude && (
              <Badge variant="outline" className="ml-2 text-xs">
                {agents.claude.relevance_score}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="gpt4o" disabled={!agents.gpt4o}>
            🤖 GPT-4o
            {agents.gpt4o && (
              <Badge variant="outline" className="ml-2 text-xs">
                {agents.gpt4o.relevance_score}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="gemini" disabled={!agents.gemini}>
            🌟 Gemini
            {agents.gemini && (
              <Badge variant="outline" className="ml-2 text-xs">
                {agents.gemini.relevance_score}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claude" className="mt-4">
          {renderAgentCard('claude', '🧠', 'Claude Sonnet 4.5')}
        </TabsContent>

        <TabsContent value="gpt4o" className="mt-4">
          {renderAgentCard('gpt4o', '🤖', 'GPT-4o')}
        </TabsContent>

        <TabsContent value="gemini" className="mt-4">
          {renderAgentCard('gemini', '🌟', 'Gemini 2.0 Flash')}
        </TabsContent>
      </Tabs>

      {/* Edit Mode */}
      {editMode ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Éditez votre commentaire:
            </label>
            <Textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              rows={6}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleApprove}
              variant="default"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver & Copier
            </Button>
            <Button
              onClick={() => setEditMode(false)}
              variant="outline"
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setEditMode(true)}
            variant="outline"
            className="flex-1"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Éditer
          </Button>
          <Button
            onClick={handleApprove}
            variant="default"
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approuver & Copier
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
