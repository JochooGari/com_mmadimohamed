import { useEffect, useMemo, useState } from 'react';
import { tryGetSupabaseClient } from '../lib/supabase';
import { defaultContent } from '../data/defaultContent';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Eye, 
  Download,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';

function lastNDays(n: number) {
  const arr: { day: string; views: number; articles: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    arr.push({ day: `${d.getDate()}/${d.getMonth()+1}`, views: 100 + Math.round(Math.random()*80), articles: Math.round(Math.random()*2) });
  }
  return arr;
}

export default function AdminDashboard() {
  const [publishedArticles, setPublishedArticles] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [leads, setLeads] = useState(0);
  const [seoScore, setSeoScore] = useState(85);

  useEffect(() => {
    const supabase = tryGetSupabaseClient();
    (async () => {
      if (supabase) {
        const { count: aCount } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', true);
        const { count: rCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('published', true);
        setPublishedArticles(aCount || 0);
        setResourcesCount(rCount || 0);
      } else {
        setPublishedArticles(defaultContent.blog.filter(b => b.published).length);
        setResourcesCount(defaultContent.resources.length);
      }
      // Leads: si un jour on stocke des messages en local, on les lira ici
      try { const raw = window.localStorage.getItem('local:leads'); setLeads(raw ? JSON.parse(raw).length : 0); } catch { setLeads(0); }
    })();
  }, []);

  const traffic = useMemo(() => lastNDays(14), []);
  const topPosts = useMemo(() => defaultContent.blog.slice(0, 5).map((b, i) => ({ name: b.title.slice(0, 14)+(b.title.length>14?'…':''), views: 80 + 20*i })), []);
  
  const quickStats = [
    { label: 'Articles publiés', value: publishedArticles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', change: '+12%', trend: 'up' },
    { label: 'Ressources', value: resourcesCount, icon: FolderOpen, color: 'text-green-600', bg: 'bg-green-100', change: '+8%', trend: 'up' },
    { label: 'Leads générés', value: leads, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', change: '+24%', trend: 'up' },
    { label: 'Score SEO', value: `${seoScore}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100', change: '+5%', trend: 'up' },
  ];
  
  const recentActivities = [
    { type: 'article', title: 'Nouvel article publié: Guide Power BI avancé', time: 'Il y a 2 heures', icon: FileText },
    { type: 'resource', title: 'Template Excel mis à jour', time: 'Il y a 4 heures', icon: FolderOpen },
    { type: 'lead', title: '3 nouveaux leads générés', time: 'Il y a 6 heures', icon: Users },
    { type: 'workflow', title: 'Workflow IA exécuté avec succès', time: 'Il y a 8 heures', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de vos performances</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Derniers 30 jours
          </Button>
          <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
            <Eye className="w-4 h-4 mr-2" />
            Voir le site
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ml-1 ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Trafic (14 jours)</CardTitle>
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              +15% vs mois dernier
            </Badge>
          </CardHeader>
          <CardContent>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                    name="Vues" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top contenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPosts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="views" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Articles récents</CardTitle>
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defaultContent.blog.slice(0,4).map(b => (
                <div key={b.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Resources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Ressources populaires</CardTitle>
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defaultContent.resources.slice(0,4).map(r => (
                <div key={r.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">{r.category}</p>
                      <Badge variant="outline" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        {r.downloadCount}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions rapides</h3>
              <p className="text-gray-600">Accédez rapidement aux fonctionnalités principales</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Nouvel article
              </Button>
              <Button variant="outline" size="sm">
                <FolderOpen className="w-4 h-4 mr-2" />
                Nouvelle ressource
              </Button>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                <Zap className="w-4 h-4 mr-2" />
                Lancer workflow IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}