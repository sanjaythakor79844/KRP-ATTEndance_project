import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Attendance } from './components/Attendance';
import { Projects } from './components/Projects';
import { Students } from './components/Students';
import { Templates } from './components/Templates';
import { Logs } from './components/Logs';
import { Broadcast } from './components/Broadcast';
import { Login } from './components/Login';

export default function App() {
  const [currentPage, setCurrentPage] = useState('attendance');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('krp_auth');
    const authTime = localStorage.getItem('krp_auth_time');
    
    if (authStatus === 'true' && authTime) {
      // Check if auth is still valid (30 days for testing)
      const timeDiff = Date.now() - parseInt(authTime);
      const daysElapsed = timeDiff / (1000 * 60 * 60 * 24);
      
      if (daysElapsed < 30) {
        setIsAuthenticated(true);
      } else {
        // Auth expired after 30 days, clear it
        localStorage.removeItem('krp_auth');
        localStorage.removeItem('krp_auth_time');
      }
    }
    
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('krp_auth');
    localStorage.removeItem('krp_auth_time');
    setIsAuthenticated(false);
    setCurrentPage('attendance');
  };

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

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show dashboard if authenticated
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
