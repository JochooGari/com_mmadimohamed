import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  ExternalLink,
  Maximize2,
  CheckCircle,
  SkipForward
} from 'lucide-react';
import type { LinkedInPost } from '@/types/linkedin';

interface LinkedInPostCardProps {
  post: LinkedInPost;
  onAction: (postId: string, action: 'approve' | 'skip' | 'edit') => void;
  onFocus: () => void;
}

export function LinkedInPostCard({ post, onAction, onFocus }: LinkedInPostCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'to_engage': return 'bg-orange-100 text-orange-800';
      case 'engaged': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={post.author_avatar_url || 'https://via.placeholder.com/50'}
          alt={post.author_name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{post.author_name}</h3>
          <p className="text-sm text-gray-500">{post.author_headline}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {post.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.comments_count}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="w-4 h-4" />
              {post.reposts_count}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={getScoreColor(post.relevance_score)}>
            Score: {post.relevance_score}/10
          </Badge>
          {post.is_lead_opportunity && (
            <Badge variant="destructive">
              🎯 Lead {post.lead_priority?.toUpperCase()}
            </Badge>
          )}
          <Badge className={getStatusColor(post.status)}>
            {post.status === 'new' && '🆕 Nouveau'}
            {post.status === 'to_engage' && '🎯 À traiter'}
            {post.status === 'engaged' && '✅ Engagé'}
            {post.status === 'skipped' && '⏭️ Ignoré'}
          </Badge>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-gray-700 line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Category & Link */}
      <div className="flex items-center gap-3 mb-4">
        {post.category && (
          <Badge variant="outline">
            {post.category}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(post.post_url, '_blank')}
          className="ml-auto"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Voir sur LinkedIn
        </Button>
      </div>

      {/* AI Agents Preview */}
      {post.agents_responses && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Agents IA:</span>
            {post.agents_responses.claude && (
              <Badge variant={post.selected_agent === 'claude' ? 'default' : 'outline'} className="text-xs">
                🧠 Claude {post.selected_agent === 'claude' && '✓'}
              </Badge>
            )}
            {post.agents_responses.gpt4o && (
              <Badge variant={post.selected_agent === 'gpt4o' ? 'default' : 'outline'} className="text-xs">
                🤖 GPT-4o {post.selected_agent === 'gpt4o' && '✓'}
              </Badge>
            )}
            {post.agents_responses.gemini && (
              <Badge variant={post.selected_agent === 'gemini' ? 'default' : 'outline'} className="text-xs">
                🌟 Gemini {post.selected_agent === 'gemini' && '✓'}
              </Badge>
            )}
          </div>
          {post.suggested_comment && (
            <p className="text-sm text-gray-600 line-clamp-2">
              "{post.suggested_comment.substring(0, 100)}..."
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onFocus}
          variant="outline"
          className="flex-1"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Mode Focus
        </Button>
        {post.status !== 'engaged' && (
          <>
            <Button
              onClick={() => onAction(post.id, 'approve')}
              variant="default"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver
            </Button>
            <Button
              onClick={() => onAction(post.id, 'skip')}
              variant="ghost"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
