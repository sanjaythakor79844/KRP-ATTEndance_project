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
    <nav className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-4">
        <h2 className="text-gray-500 text-xs uppercase tracking-wider mb-6 font-medium">MENU</h2>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
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
