import { 
  LayoutDashboard, 
  Edit3, 
  Bot, 
  CheckCircle, 
  Search, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content-studio', label: 'Content Studio', icon: Edit3 },
    { id: 'ai-agents', label: 'AI Agents', icon: Bot },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">MM</span>
          </div>
          <div>
            <h1 className="text-sm font-medium">Chef de projet Data</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
          Navigation
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-9 ${
                  activeSection === item.id 
                    ? "bg-teal-500 text-white hover:bg-teal-600" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}