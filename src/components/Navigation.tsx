import { LayoutDashboard, FolderKanban, Users, FileText, List, ClipboardCheck, Radio } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'broadcast', label: 'Broadcast', icon: Radio },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'logs', label: 'Logs', icon: List },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  ];

  return (
    <nav className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Menu</h2>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
