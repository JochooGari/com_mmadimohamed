import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Edit3, 
  Bot, 
  CheckCircle, 
  Search, 
  BarChart3, 
  Settings,
  FileText,
  FolderOpen,
  Workflow,
  Brain,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { tryGetSupabaseClient } from '../../lib/supabase';
import { BrowserFileStorage } from '../../lib/browserStorage';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/workflow', label: 'Workflow', icon: Workflow },
  { to: '/admin/articles', label: 'Articles', icon: FileText },
  { to: '/admin/resources', label: 'Ressources', icon: FolderOpen },
  { to: '/admin/agents', label: 'AI Agents', icon: Bot },
  { to: '/admin/linkedin-agent', label: 'LinkedIn Agent', icon: Brain },
  { to: '/admin/geo-agent', label: 'GEO Agent', icon: Search },
  { to: '/admin/approvals', label: 'Approvals', icon: CheckCircle },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Modern Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">MP</span>
              </div>
              <div>
                <Link to="/" className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors">
                  MagicPath
                </Link>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
              Navigation
            </div>
            <nav className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to, item.exact);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive: routerActive }) => {
                      const currentActive = item.exact ? routerActive : active;
                      return `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentActive
                          ? "bg-teal-500 text-white shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`;
                    }}
                  >
                    <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              {/* Logout button */}
              <button
                onClick={async () => {
                  const ok = window.confirm('Voulez-vous vous déconnecter ?');
                  if (!ok) return;
                  try {
                    // Déconnexion Supabase si configuré
                    const supabase = tryGetSupabaseClient();
                    if (supabase) {
                      await supabase.auth.signOut();
                    }
                  } catch (e) {
                    console.warn('Sign out error:', e);
                  }
                  try {
                    // Nettoyer les marqueurs de session locale (sans supprimer vos sources)
                    localStorage.removeItem('isLocalAdmin');
                    localStorage.removeItem('linkedin:chat-history');
                  } catch {}
                  try {
                    // Optionnel: purge légère d'IndexedDB des sessions (pas des documents)
                    // Laisse les sources persistées intactes
                    await BrowserFileStorage.initDatabase();
                  } catch {}
                  navigate('/login');
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>Se déconnecter</span>
              </button>
            </nav>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">AB</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@magicpath.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  {nav.find(item => isActive(item.to, item.exact))?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="w-64 px-3 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <Button variant="outline" size="sm">
                  <Link to="/" className="flex items-center">
                    Voir le site
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


