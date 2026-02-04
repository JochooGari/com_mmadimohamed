import { getSupabaseClient } from '@/lib/supabase';
import type {
  LinkedInPost,
  PostFilters,
  DashboardStats
} from '@/types/linkedin';

const supabase = getSupabaseClient();

class LinkedInService {
  /**
   * Get posts with filters
   */
  async getPosts(filters: PostFilters): Promise<LinkedInPost[]> {
    try {
      let query = supabase
        .from('linkedin_posts')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.minScore) {
        query = query.gte('relevance_score', filters.minScore);
      }

      if (filters.leadPriority) {
        query = query
          .eq('is_lead_opportunity', true)
          .eq('lead_priority', filters.leadPriority);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<LinkedInPost | null> {
    try {
      const { data, error } = await supabase
        .from('linkedin_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to fetch post:', error);
      return null;
    }
  }

  /**
   * Approve a post (copy to clipboard and mark as engaged)
   */
  async approvePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('linkedin_posts')
        .update({
          status: 'engaged',
          comment_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to approve post:', error);
      throw error;
    }
  }

  /**
   * Skip a post
   */
  async skipPost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('linkedin_posts')
        .update({
          status: 'skipped',
          comment_status: 'skipped',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to skip post:', error);
      throw error;
    }
  }

  /**
   * Update edited comment
   */
  async updateComment(postId: string, comment: string, selectedAgent?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('linkedin_posts')
        .update({
          user_edited_comment: comment,
          selected_agent: selectedAgent,
          comment_status: 'edited',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get posts to process (new + to_engage)
      const { count: postsCount } = await supabase
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'to_engage']);

      // Get comments today
      const today = new Date().toISOString().split('T')[0];
      const { count: commentsCount } = await supabase
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'engaged')
        .gte('updated_at', today);

      // Get leads this month
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: leadsCount } = await supabase
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_lead_opportunity', true)
        .gte('created_at', firstDayOfMonth);

      // Get hot opportunities (high priority leads with score >= 8)
      const { data: hotOpps } = await supabase
        .from('linkedin_posts')
        .select('*')
        .eq('is_lead_opportunity', true)
        .eq('lead_priority', 'high')
        .gte('relevance_score', 8)
        .in('status', ['new', 'to_engage'])
        .order('relevance_score', { ascending: false })
        .limit(5);

      // Calculate agent performance (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentPosts } = await supabase
        .from('linkedin_posts')
        .select('selected_agent, agents_responses')
        .gte('created_at', sevenDaysAgo)
        .not('selected_agent', 'is', null);

      const agentStats = {
        claude: { selected: 0, totalTime: 0, count: 0 },
        gpt4o: { selected: 0, totalTime: 0, count: 0 },
        gemini: { selected: 0, totalTime: 0, count: 0 }
      };

      recentPosts?.forEach((post) => {
        if (post.selected_agent) {
          agentStats[post.selected_agent as keyof typeof agentStats].selected++;
        }

        // Calculate response times
        if (post.agents_responses) {
          Object.entries(post.agents_responses).forEach(([agent, response]: [string, any]) => {
            if (response?.response_time_ms) {
              const agentKey = agent as keyof typeof agentStats;
              agentStats[agentKey].totalTime += response.response_time_ms;
              agentStats[agentKey].count++;
            }
          });
        }
      });

      const totalSelected = recentPosts?.length || 1;

      return {
        postsToProcess: postsCount || 0,
        commentsToday: commentsCount || 0,
        leadsThisMonth: leadsCount || 0,
        scrapingProgress: {
          current: 0,
          total: 100,
          percentage: 0
        },
        aiAnalysisProgress: {
          claude: 'idle',
          gpt4o: 'idle',
          gemini: 'idle'
        },
        hotOpportunities: hotOpps?.map((opp) => ({
          id: opp.id,
          authorName: opp.author_name,
          authorTitle: opp.author_headline || '',
          score: opp.relevance_score,
          leadPriority: opp.lead_priority || 'medium'
        })) || [],
        agentPerformance: {
          claude: {
            selectedRate: Math.round((agentStats.claude.selected / totalSelected) * 100),
            avgResponseTime: agentStats.claude.count > 0
              ? Math.round(agentStats.claude.totalTime / agentStats.claude.count)
              : 0
          },
          gpt4o: {
            selectedRate: Math.round((agentStats.gpt4o.selected / totalSelected) * 100),
            avgResponseTime: agentStats.gpt4o.count > 0
              ? Math.round(agentStats.gpt4o.totalTime / agentStats.gpt4o.count)
              : 0
          },
          gemini: {
            selectedRate: Math.round((agentStats.gemini.selected / totalSelected) * 100),
            avgResponseTime: agentStats.gemini.count > 0
              ? Math.round(agentStats.gemini.totalTime / agentStats.gemini.count)
              : 0
          }
        },
        costs: {
          total: 90.5, // TODO: Calculate from actual API usage
          uptime: 99.8
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Trigger scraping workflow (via n8n webhook)
   */
  async triggerScraping(): Promise<void> {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_SCRAPING_WEBHOOK;

      if (!webhookUrl) {
        console.warn('Scraping webhook URL not configured');
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger: 'manual',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger scraping');
      }
    } catch (error) {
      console.error('Failed to trigger scraping:', error);
      throw error;
    }
  }

  /**
   * Trigger re-analysis workflow (via n8n webhook)
   * Analyzes posts and proposes comments
   */
  async triggerReAnalysis(): Promise<void> {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_ANALYSIS_WEBHOOK;

      if (!webhookUrl) {
        console.warn('Analysis webhook URL not configured');
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger: 'manual',
          action: 're-analyze',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger re-analysis');
      }
    } catch (error) {
      console.error('Failed to trigger re-analysis:', error);
      throw error;
    }
  }
}

export const linkedinService = new LinkedInService();
