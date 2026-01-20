import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Filter,
  Search,
  Maximize2,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { LinkedInPostCard } from '@/components/linkedin/LinkedInPostCard';
import { AgentArena } from '@/components/linkedin/AgentArena';
import { linkedinService } from '@/services/linkedinService';
import type { LinkedInPost, PostFilters } from '@/types/linkedin';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminLinkedInPosts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusPostId = searchParams.get('focus');
  const filterPreset = searchParams.get('filter');

  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PostFilters>({
    status: filterPreset === 'high_priority' ? 'new' : 'all',
    category: 'all',
    minScore: filterPreset === 'high_priority' ? 8 : 0,
    leadPriority: filterPreset === 'high_priority' ? 'high' : undefined,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'focus'>('list');
  const [focusedPostIndex, setFocusedPostIndex] = useState(0);

  useEffect(() => {
    loadPosts();
  }, [filters]);

  useEffect(() => {
    // If focus param exists, find that post and switch to focus mode
    if (focusPostId && posts.length > 0) {
      const index = posts.findIndex(p => p.id === focusPostId);
      if (index !== -1) {
        setFocusedPostIndex(index);
        setViewMode('focus');
      }
    }
  }, [focusPostId, posts]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await linkedinService.getPosts(filters);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAction = async (
    postId: string,
    action: 'approve' | 'skip' | 'edit'
  ) => {
    try {
      if (action === 'approve') {
        await linkedinService.approvePost(postId);
        toast.success('Commentaire approuvé et copié dans le presse-papier');
      } else if (action === 'skip') {
        await linkedinService.skipPost(postId);
        toast.info('Post ignoré');
      }

      // Refresh posts
      loadPosts();

      // In focus mode, move to next post
      if (viewMode === 'focus' && action !== 'edit') {
        handleNextPost();
      }
    } catch (error) {
      console.error('Post action failed:', error);
      toast.error('Erreur lors de l\'action');
    }
  };

  const handleNextPost = () => {
    if (focusedPostIndex < posts.length - 1) {
      setFocusedPostIndex(focusedPostIndex + 1);
    }
  };

  const handlePreviousPost = () => {
    if (focusedPostIndex > 0) {
      setFocusedPostIndex(focusedPostIndex - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (viewMode === 'focus') {
      if (e.key === '1') {
        handlePostAction(posts[focusedPostIndex].id, 'approve');
      } else if (e.key === '2') {
        // Edit mode
        handlePostAction(posts[focusedPostIndex].id, 'edit');
      } else if (e.key === '3') {
        handlePostAction(posts[focusedPostIndex].id, 'skip');
      } else if (e.key === 'ArrowRight') {
        handleNextPost();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousPost();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, focusedPostIndex, posts]);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.author_name?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.author_headline?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Focus Mode - One post at a time
  if (viewMode === 'focus') {
    const focusedPost = filteredPosts[focusedPostIndex];

    if (!focusedPost) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Aucun post à afficher</p>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-gray-900/95 z-50 overflow-y-auto">
        <div className="min-h-screen p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 text-white">
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                className="text-white hover:bg-white/10"
              >
                ✕ Fermer
              </Button>
              <div className="text-sm">
                Post {focusedPostIndex + 1}/{filteredPosts.length}
              </div>
            </div>

            {/* Post Card */}
            <Card className="p-6 mb-6 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={focusedPost.author_avatar_url || 'https://via.placeholder.com/50'}
                  alt={focusedPost.author_name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{focusedPost.author_name}</h3>
                  <p className="text-sm text-gray-500">{focusedPost.author_headline}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {focusedPost.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {focusedPost.comments_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="w-4 h-4" />
                      {focusedPost.reposts_count}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      focusedPost.relevance_score >= 8
                        ? 'default'
                        : focusedPost.relevance_score >= 6
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    Score: {focusedPost.relevance_score}/10
                  </Badge>
                  {focusedPost.is_lead_opportunity && (
                    <Badge variant="destructive">
                      🎯 Lead {focusedPost.lead_priority?.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="prose max-w-none mb-4">
                <p className="whitespace-pre-wrap">{focusedPost.content}</p>
              </div>

              {/* Link to LinkedIn */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(focusedPost.post_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir sur LinkedIn
              </Button>
            </Card>

            {/* Agent Arena */}
            <AgentArena
              post={focusedPost}
              onApprove={() => handlePostAction(focusedPost.id, 'approve')}
              onSkip={() => handlePostAction(focusedPost.id, 'skip')}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 text-white">
              <Button
                variant="ghost"
                onClick={handlePreviousPost}
                disabled={focusedPostIndex === 0}
                className="text-white hover:bg-white/10"
              >
                ◄ Précédent
              </Button>
              <div className="text-sm text-gray-400">
                Raccourcis: 1 (Approuver) · 2 (Éditer) · 3 (Passer) · ← → (Navigation)
              </div>
              <Button
                variant="ghost"
                onClick={handleNextPost}
                disabled={focusedPostIndex === filteredPosts.length - 1}
                className="text-white hover:bg-white/10"
              >
                Suivant ►
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List Mode
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts à Engager</h1>
          <p className="text-gray-500 mt-1">
            {filteredPosts.length} posts · Sélectionnez et agissez
          </p>
        </div>
        <Button
          onClick={() => setViewMode('focus')}
          variant="outline"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Mode Focus
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value as any })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="new">🆕 Nouveaux</SelectItem>
              <SelectItem value="to_engage">🎯 À traiter</SelectItem>
              <SelectItem value="engaged">✅ Engagés</SelectItem>
              <SelectItem value="skipped">⏭️ Ignorés</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value as any })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="bi">BI</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={loadPosts}>
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Aucun post à afficher avec ces filtres</p>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <LinkedInPostCard
              key={post.id}
              post={post}
              onAction={handlePostAction}
              onFocus={() => {
                const index = filteredPosts.findIndex(p => p.id === post.id);
                setFocusedPostIndex(index);
                setViewMode('focus');
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
