import { LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-gray-900">KRP Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-sm font-bold">KRP</span>
        </div>
      </div>
    </header>
  );
}
