export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-gray-900">KRP Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white">KRP</span>
        </div>
      </div>
    </header>
  );
}
