import { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Attendance } from './components/Attendance';
import { Projects } from './components/Projects';
import { Students } from './components/Students';
import { Templates } from './components/Templates';
import { Logs } from './components/Logs';
import { Broadcast } from './components/Broadcast';

export default function App() {
  const [currentPage, setCurrentPage] = useState('attendance');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'attendance':
        return <Attendance />;
      case 'projects':
        return <Projects />;
      case 'students':
        return <Students />;
      case 'broadcast':
        return <Broadcast />;
      case 'templates':
        return <Templates />;
      case 'logs':
        return <Logs />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
