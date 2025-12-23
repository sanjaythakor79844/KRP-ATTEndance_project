import { useState, useEffect } from 'react';
import { RefreshCw, Download, Filter, Activity, TrendingUp, AlertCircle, Clock, Users, CheckCircle, XCircle, Zap, BarChart3 } from 'lucide-react';

interface Log {
  id: string;
  timestamp: string;
  action: string;
  student: string;
  assignedCount: number;
  status: 'success' | 'failed';
  details?: string;
}

export function Logs() {
  const [logs] = useState<Log[]>([
    { id: '1', timestamp: '2024-12-17 10:30', action: 'Assignment Sent', student: 'Alice Johnson', assignedCount: 3, status: 'success', details: 'Project Management Module' },
    { id: '2', timestamp: '2024-12-17 10:25', action: 'Assignment Sent', student: 'Carol White', assignedCount: 2, status: 'success', details: 'Advanced Techniques' },
    { id: '3', timestamp: '2024-12-17 10:20', action: 'Assignment Failed', student: 'Bob Smith', assignedCount: 3, status: 'failed', details: 'User not found' },
    { id: '4', timestamp: '2024-12-16 15:45', action: 'Assignment Sent', student: 'Alice Johnson', assignedCount: 2, status: 'success', details: 'Database Design' },
    { id: '5', timestamp: '2024-12-16 15:40', action: 'Broadcast Sent', student: 'All eligible (3)', assignedCount: 0, status: 'success', details: 'Weekly announcement' },
    { id: '6', timestamp: '2024-12-16 12:15', action: 'Assignment Sent', student: 'Carol White', assignedCount: 1, status: 'success', details: 'API Development' },
    { id: '7', timestamp: '2024-12-15 09:30', action: 'Assignment Sent', student: 'David Lee', assignedCount: 1, status: 'success', details: 'Frontend Framework' },
    { id: '8', timestamp: '2024-12-15 09:15', action: 'Broadcast Sent', student: 'All eligible (4)', assignedCount: 0, status: 'success', details: 'Schedule update' },
    { id: '9', timestamp: '2024-12-14 16:20', action: 'Student Registered', student: 'Emma Wilson', assignedCount: 0, status: 'success', details: 'New student onboarding' },
    { id: '10', timestamp: '2024-12-14 14:10', action: 'Attendance Marked', student: 'Alice Johnson', assignedCount: 0, status: 'success', details: 'Present' },
  ]);

  const [stats] = useState({
    totalAssignments: 156,
    students: [
      { name: 'Alice Johnson', count: 52 },
      { name: 'Bob Smith', count: 51 },
      { name: 'Carol White', count: 53 },
    ],
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredLogs = filterStatus === 'all' 
    ? logs 
    : logs.filter(log => log.status === filterStatus);

  const successCount = logs.filter(l => l.status === 'success').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;
  const successRate = Math.round((successCount / logs.length) * 100);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'Action', 'Student', 'Count', 'Status'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.action,
        log.student,
        log.assignedCount,
        log.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `krp_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enhanced Header Section */}
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
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl font-bold"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl font-bold"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-4xl font-black text-gray-900">{successRate}%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Success Rate</h3>
            <p className="text-gray-500 text-sm font-medium">{successCount} successful</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <span className="text-4xl font-black text-gray-900">{failedCount}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Failed Actions</h3>
            <p className="text-gray-500 text-sm font-medium">Needs attention</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-4xl font-black text-gray-900">{stats.students.length}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Active Students</h3>
            <p className="text-gray-500 text-sm font-medium">Currently enrolled</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Enhanced Distribution Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Workload Distribution</h3>
            </div>
            <div className="space-y-5">
              {stats.students.map((student, idx) => {
                const percentage = Math.round((student.count / stats.totalAssignments) * 100);
                const colors = [
                  { from: 'from-purple-500', to: 'to-purple-600', bg: 'bg-purple-100' },
                  { from: 'from-pink-500', to: 'to-pink-600', bg: 'bg-pink-100' },
                  { from: 'from-blue-500', to: 'to-blue-600', bg: 'bg-blue-100' },
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={idx} className={`${color.bg} rounded-xl p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">{student.name}</span>
                      <span className="text-lg font-black text-gray-900">{percentage}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 shadow-inner">
                      <div
                        className={`bg-gradient-to-r ${color.from} ${color.to} h-3 rounded-full transition-all shadow-md`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-semibold">{student.count} assignments</span>
                      <span className="text-gray-500">of {stats.totalAssignments} total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Enhanced Progress Tracker */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-indigo-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Assignment Progress Tracker</h3>
              </div>
              <div className="space-y-4">
                {stats.students.map((student, idx) => {
                  const percentage = Math.round((student.count / stats.totalAssignments) * 100);
                  const isBalanced = Math.abs(percentage - 33.33) < 2;
                  return (
                    <div key={idx} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 hover:border-purple-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isBalanced ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                          }`} />
                          <span className="text-base font-black text-gray-900">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">{student.count} tasks</span>
                          <span className={`text-xs font-black px-4 py-1.5 rounded-full shadow-md ${
                            isBalanced ? 'bg-green-500 text-white' : 'bg-yellow-400 text-gray-900'
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-5 shadow-inner">
                        <div
                          className={`h-5 rounded-full transition-all shadow-lg ${
                            isBalanced ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600' : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Balance Target: ~33% per student</p>
                      <p className="text-xs text-gray-600">Green indicator shows balanced workload distribution across all students.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Activity Cards */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-pink-500">
              <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white">Recent Activity Feed</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        filterStatus === 'all'
                          ? 'bg-white text-purple-600 shadow-xl scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Filter className="w-4 h-4 inline mr-2" />
                      All ({logs.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('success')}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        filterStatus === 'success'
                          ? 'bg-white text-green-600 shadow-xl scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Success ({successCount})
                    </button>
                    <button
                      onClick={() => setFilterStatus('failed')}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        filterStatus === 'failed'
                          ? 'bg-white text-red-600 shadow-xl scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Failed ({failedCount})
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No logs found matching the selected filter.</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`rounded-xl p-5 border-l-4 transition-all hover:shadow-lg ${
                        log.status === 'success'
                          ? 'bg-green-50 border-green-500 hover:bg-green-100'
                          : 'bg-red-50 border-red-500 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              log.status === 'success' ? 'bg-green-200' : 'bg-red-200'
                            }`}>
                              {log.status === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-700" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-700" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-base font-black text-gray-900">{log.action}</h4>
                              <p className="text-sm text-gray-600 font-medium">{log.student}</p>
                            </div>
                          </div>
                          {log.details && (
                            <p className="text-sm text-gray-600 ml-14 mb-2">{log.details}</p>
                          )}
                          <div className="flex items-center gap-4 ml-14 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.timestamp}
                            </span>
                            {log.assignedCount > 0 && (
                              <span className="bg-gray-200 px-3 py-1 rounded-full font-semibold">
                                Count: {log.assignedCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-black shadow-md ${
                          log.status === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
