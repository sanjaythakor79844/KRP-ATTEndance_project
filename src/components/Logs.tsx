import { useState, useEffect } from 'react';
import { RefreshCw, Activity, Clock, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Log {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
}

export function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load logs from API
  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight">
                    📊 Activity Logs
                  </h1>
                  <p className="text-purple-100 text-lg font-medium">KRP Admin - Real-time System Monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">Live Updates</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl font-bold disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-emerald-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Activity className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="text-4xl font-black text-gray-900">{logs.length}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Total Activities</h3>
            <p className="text-gray-500 text-sm font-medium">All logged actions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-4xl font-black text-gray-900">{logs.length > 0 ? 'Today' : 'N/A'}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-gray-500 text-sm font-medium">Latest system events</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-4xl font-black text-gray-900">Live</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">System Status</h3>
            <p className="text-gray-500 text-sm font-medium">All systems operational</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-pink-500">
          <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">Recent Activity Feed</span>
            </div>
          </div>
          
          <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500 font-semibold">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No activity logs yet.</p>
                <p className="text-gray-400 text-sm mt-2">Start using the system to see logs here.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl p-5 border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-200">
                          <Activity className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-gray-900">{log.action}</h4>
                          {log.details && (
                            <p className="text-sm text-gray-600 font-medium">{log.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-14 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
