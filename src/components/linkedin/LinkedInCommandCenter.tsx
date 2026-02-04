import React, { useState, useEffect } from 'react';
import { tryGetSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// Types pour le Command Center
interface LeadOpportunity {
  id: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  score: number;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

interface PipelineStatus {
  scrapingProgress: number;
  analysisProgress: number;
  liveProcess: string;
  pendingEnrichment: number;
  agentModel: string;
}

interface StatsData {
  toProcess: number;
  todaysActivity: number;
  activityChange: number;
  leadsGenerated: number;
}

// Composant Stats Card
const StatCard: React.FC<{
  label: string;
  value: number;
  subtext?: string;
  changePercent?: number;
  icon: React.ReactNode;
  iconColor: string;
}> = ({ label, value, subtext, changePercent, icon, iconColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <span className={iconColor}>{icon}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      {changePercent !== undefined && (
        <span className={`text-xs font-medium ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {changePercent >= 0 ? '+' : ''}{changePercent}%
        </span>
      )}
      {subtext && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{subtext}</span>
      )}
    </div>
  </div>
);

// Composant Lead Card
const LeadCard: React.FC<{
  lead: LeadOpportunity;
  onProcess: (id: string) => void;
  priority?: 'high' | 'medium' | 'low';
}> = ({ lead, onProcess, priority = 'medium' }) => {
  const scoreColor = lead.score >= 8.5
    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/50'
    : lead.score >= 7.5
    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/50'
    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-600';

  const opacity = priority === 'high' ? '' : priority === 'medium' ? 'opacity-70' : 'opacity-50';

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-teal-500/50 hover:shadow-lg transition-all group flex flex-col justify-between h-44 ${opacity}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-tr ${lead.gradientFrom} ${lead.gradientTo} text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white dark:ring-gray-700`}
            >
              {lead.initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{lead.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{lead.title} @ {lead.company}</p>
            </div>
          </div>
          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreColor}`}>
            {lead.score.toFixed(1)}/10
          </div>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {lead.description}
        </p>
      </div>
      <button
        onClick={() => onProcess(lead.id)}
        className="w-full py-2 bg-teal-500/10 hover:bg-teal-500 text-teal-500 hover:text-white dark:bg-teal-500/20 dark:hover:bg-teal-500 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        Process Now
        <span className="material-symbols-outlined text-xs">arrow_forward</span>
      </button>
    </div>
  );
};

// Composant Progress Bar
const ProgressBar: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="flex-1">
    <div className="flex justify-between text-[11px] mb-1.5">
      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
        {icon} {label}
      </span>
      <span className={`${color} font-bold`}>{value}%</span>
    </div>
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500`}
        style={{ width: `${value}%`, backgroundColor: color.includes('teal') ? '#14b8a6' : '#3b82f6' }}
      />
    </div>
  </div>
);

// Composant Principal
const LinkedInCommandCenter: React.FC = () => {
  const [mode, setMode] = useState<'copilot' | 'autopilot'>('copilot');
  const [activeSubTab, setActiveSubTab] = useState('command');
  const [stats, setStats] = useState<StatsData>({
    toProcess: 23,
    todaysActivity: 45,
    activityChange: 12,
    leadsGenerated: 312
  });
  const [pipeline, setPipeline] = useState<PipelineStatus>({
    scrapingProgress: 87,
    analysisProgress: 45,
    liveProcess: 'Processing interaction from "SaaS Weekly"',
    pendingEnrichment: 8,
    agentModel: 'Claude 3.5 Sonnet'
  });
  const [leads, setLeads] = useState<LeadOpportunity[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      initials: 'JD',
      title: 'CTO',
      company: 'TechFlow',
      score: 9.5,
      description: 'Engaged with "Cloud Migration" post. High intent signal detected.',
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-teal-500'
    },
    {
      id: '2',
      name: 'Sarah Miller',
      initials: 'SM',
      title: 'VP Sales',
      company: 'GrowthCo',
      score: 9.2,
      description: 'Liked 3 recent posts. Matching ICP Tier 1 perfectly.',
      gradientFrom: 'from-purple-400',
      gradientTo: 'to-indigo-500'
    },
    {
      id: '3',
      name: 'Alex Loop',
      initials: 'AL',
      title: 'Founder',
      company: 'StartupX',
      score: 8.8,
      description: 'Requested more info on AI integration via comment.',
      gradientFrom: 'from-orange-400',
      gradientTo: 'to-red-500'
    },
    {
      id: '4',
      name: 'Marc K.',
      initials: 'MK',
      title: 'Product',
      company: 'Flow',
      score: 8.5,
      description: 'Frequent visitor of your profile. High affinity.',
      gradientFrom: 'from-gray-400',
      gradientTo: 'to-gray-500'
    },
    {
      id: '5',
      name: 'Lucie B.',
      initials: 'LB',
      title: 'CEO',
      company: 'Agency',
      score: 8.3,
      description: 'Commented "Interesting point!" on your latest post.',
      gradientFrom: 'from-pink-400',
      gradientTo: 'to-rose-500'
    },
    {
      id: '6',
      name: 'Robert F.',
      initials: 'RF',
      title: 'Manager',
      company: 'Net',
      score: 8.1,
      description: 'Shared your article on AI Automation.',
      gradientFrom: 'from-cyan-400',
      gradientTo: 'to-blue-500'
    }
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Charger les posts depuis Supabase
  useEffect(() => {
    loadLeadsFromSupabase();
  }, []);

  const loadLeadsFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using mock data');
      return;
    }

    const supabase = tryGetSupabaseClient();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('linkedin_posts')
        .select('*')
        .eq('is_lead_opportunity', true)
        .order('relevance_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedLeads: LeadOpportunity[] = data.map((post, index) => ({
          id: post.id,
          name: post.author_name,
          initials: getInitials(post.author_name),
          title: extractTitle(post.author_headline),
          company: extractCompany(post.author_headline),
          score: post.relevance_score,
          description: post.lead_reasoning || post.content?.substring(0, 100) + '...',
          gradientFrom: getGradientFrom(index),
          gradientTo: getGradientTo(index)
        }));
        setLeads(mappedLeads);

        // Mettre à jour les stats
        const { count: toProcessCount } = await supabase
          .from('linkedin_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');

        setStats(prev => ({
          ...prev,
          toProcess: toProcessCount || prev.toProcess,
          leadsGenerated: data.length
        }));
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const extractTitle = (headline: string | null): string => {
    if (!headline) return 'Unknown';
    const parts = headline.split('@')[0].split('|')[0].split('-')[0];
    return parts.trim().substring(0, 20);
  };

  const extractCompany = (headline: string | null): string => {
    if (!headline) return 'Unknown';
    const atIndex = headline.indexOf('@');
    if (atIndex !== -1) {
      return headline.substring(atIndex + 1).split('|')[0].trim().substring(0, 15);
    }
    return 'Unknown';
  };

  const getGradientFrom = (index: number): string => {
    const gradients = ['from-blue-400', 'from-purple-400', 'from-orange-400', 'from-pink-400', 'from-cyan-400', 'from-green-400'];
    return gradients[index % gradients.length];
  };

  const getGradientTo = (index: number): string => {
    const gradients = ['to-teal-500', 'to-indigo-500', 'to-red-500', 'to-rose-500', 'to-blue-500', 'to-emerald-500'];
    return gradients[index % gradients.length];
  };

  const handleProcessLead = async (leadId: string) => {
    // Ouvrir le lead dans l'interface multi-agent
    console.log('Processing lead:', leadId);
    // TODO: Intégrer avec AgentArena
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'scrape':
        console.log('Force scraping...');
        break;
      case 'analyze':
        await loadLeadsFromSupabase();
        break;
      case 'persona':
        console.log('New persona...');
        break;
      case 'boost':
        console.log('Boost all...');
        break;
    }
  };

  const subTabs = [
    { id: 'command', label: 'Command Center', icon: 'grid_view' },
    { id: 'generator', label: 'Générateur', icon: 'auto_fix_high' },
    { id: 'campaign', label: 'Campagne', icon: 'campaign' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'config', label: 'Config', icon: 'settings' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <span className="material-symbols-outlined text-teal-500 text-2xl">priority_high</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Command Center
              <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live Agent
              </span>
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('copilot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition ${
              mode === 'copilot'
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            }`}
          >
            <span className="material-symbols-outlined text-gray-500">visibility</span> Co-pilot
          </button>
          <button
            onClick={() => setMode('autopilot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition ${
              mode === 'autopilot'
                ? 'bg-gray-900 dark:bg-black text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            }`}
          >
            <span className="material-symbols-outlined text-teal-500">bolt</span> Auto-pilot
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-700 mb-6 px-2 overflow-x-auto">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-1 font-medium text-sm transition-all whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'text-teal-500 border-b-2 border-teal-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-teal-500'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          label="To Process"
          value={stats.toProcess}
          subtext="leads waiting"
          icon={<span className="material-symbols-outlined text-yellow-500">pending_actions</span>}
          iconColor="text-yellow-500"
        />
        <StatCard
          label="Today's Activity"
          value={stats.todaysActivity}
          changePercent={stats.activityChange}
          icon={<span className="material-symbols-outlined text-teal-500">chat_bubble_outline</span>}
          iconColor="text-teal-500"
        />
        <StatCard
          label="Leads Generated"
          value={stats.leadsGenerated}
          subtext="this month"
          icon={<span className="material-symbols-outlined text-blue-500">person_add_alt</span>}
          iconColor="text-blue-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mb-6">
        <div className="flex items-center gap-3 ml-2">
          <span className="material-symbols-outlined text-gray-500">bolt</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions:</span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => handleQuickAction('scrape')}
            className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 text-sm">refresh</span> Force Scraping
          </button>
          <button
            onClick={() => handleQuickAction('analyze')}
            className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 text-sm">psychology</span> Re-Analyze Queue
          </button>
          <button
            onClick={() => handleQuickAction('persona')}
            className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 text-sm">add</span> New Persona
          </button>
          <button
            onClick={() => handleQuickAction('boost')}
            className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white hover:bg-teal-600 rounded-lg text-xs font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span> Boost All
          </button>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-6 lg:w-1/2">
            <ProgressBar
              label="1. Scraping Feed"
              value={pipeline.scrapingProgress}
              icon={<span className="material-symbols-outlined text-[14px] text-teal-500">sync</span>}
              color="text-teal-500"
            />
            <ProgressBar
              label="2. AI Analysis"
              value={pipeline.analysisProgress}
              icon={<span className="material-symbols-outlined text-[14px] text-blue-500">psychology</span>}
              color="text-blue-500"
            />
          </div>
          <div className="flex-1 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-6 flex items-center gap-8 overflow-x-auto">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-tighter leading-none mb-0.5">Live Process</span>
                <p className="text-[11px] font-medium text-gray-900 dark:text-white">{pipeline.liveProcess}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-tighter leading-none mb-0.5">Enrichment</span>
                <p className="text-[11px] font-medium text-gray-500">Pending profile enrichment: {pipeline.pendingEnrichment} profiles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 opacity-60">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-tighter leading-none mb-0.5">Agent Model</span>
                <p className="text-[11px] font-medium text-gray-500">{pipeline.agentModel}: Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hot Opportunities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
            Hot Opportunities
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {leads.length}+ New
            </span>
          </h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 mr-4">
              <span className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 ${viewMode === 'grid' ? 'text-teal-500' : 'text-gray-400 hover:text-teal-500'} transition-colors`}
              >
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 ${viewMode === 'list' ? 'text-teal-500' : 'text-gray-400 hover:text-teal-500'} transition-colors`}
              >
                <span className="material-symbols-outlined text-xl">list</span>
              </button>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-teal-500 transition-colors">
              <span className="material-symbols-outlined text-xl">filter_list</span>
            </button>
            <button
              onClick={loadLeadsFromSupabase}
              className="p-1.5 text-gray-400 hover:text-teal-500 transition-colors"
            >
              <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto max-h-[600px]">
          {leads.map((lead, index) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onProcess={handleProcessLead}
              priority={lead.score >= 8.5 ? 'high' : lead.score >= 7.5 ? 'medium' : 'low'}
            />
          ))}
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-12 h-12 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/40 flex items-center justify-center hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-xl">help_outline</span>
        </button>
      </div>
    </div>
  );
};

export default LinkedInCommandCenter;
