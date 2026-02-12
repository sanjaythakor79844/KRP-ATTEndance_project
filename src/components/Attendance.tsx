import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusChip } from './ui/StatusChip';
import { CheckCircle, XCircle, Clock, Send, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AttendanceSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

interface TodaySummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  notMarked: number;
}

export function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [selectedManager, setSelectedManager] = useState('');

  // Load students and summaries
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load students
      const studentsRes = await fetch('http://localhost:5000/api/students');
      const studentsData = await studentsRes.json();
      if (studentsData.success) {
        setStudents(studentsData.data);
      }

      // Load attendance managers
      const managersRes = await fetch('http://localhost:5000/api/attendance/managers');
      const managersData = await managersRes.json();
      if (managersData.success) {
        setManagers(managersData.data);
      }

      // Load all summaries
      const summariesRes = await fetch('http://localhost:5000/api/attendance/all-summaries');
      const summariesData = await summariesRes.json();
      if (summariesData.success) {
        setSummaries(summariesData.data);
      }

      // Load today's summary
      const todayRes = await fetch('http://localhost:5000/api/attendance/today');
      const todayData = await todayRes.json();
      if (todayData.success) {
        setTodaySummary(todayData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    setMarking(studentId);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          status,
          date: new Date().toISOString().split('T')[0],
          className: 'General Class'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Attendance marked as ${status}`);
        loadData(); // Reload data
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('❌ Error marking attendance');
    } finally {
      setMarking(null);
    }
  };

  const sendNotifications = async () => {
    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/check-and-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.message}\n\n${result.results.map((r: any) => 
          `${r.student}: ${r.type} (${r.percentage}%)`
        ).join('\n')}`);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('❌ Error sending notifications');
    } finally {
      setSending(false);
    }
  };

  const sendReminderToManager = async () => {
    if (!selectedManager) {
      alert('Please select an attendance manager');
      return;
    }

    setSendingReminder(true);
    try {
      const response = await fetch('http://localhost:5000/api/attendance/send-manager-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId: selectedManager,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        setSelectedManager('');
      } else {
        alert(`❌ Failed to send reminder: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('❌ Error sending reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="w-5 h-5 text-green-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-gray-900 mb-2">Attendance Tracking</h2>
          <p className="text-gray-600">Mark attendance and track student performance</p>
        </div>
        <div className="flex gap-3">
          <Button 
            icon={RefreshCw}
            variant="secondary"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button 
            icon={Send}
            onClick={sendNotifications}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Notifications'}
          </Button>
        </div>
      </div>

      {/* Send Reminder to Manager */}
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Send className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Send Reminder to Attendance Manager</h3>
            <p className="text-sm text-gray-600 mb-4">Send an email reminder to the attendance manager to mark today's attendance</p>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Attendance Manager</label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Select Manager --</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} — {manager.email}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                icon={Send}
                onClick={sendReminderToManager}
                disabled={sendingReminder || !selectedManager}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sendingReminder ? 'Sending...' : 'Send Reminder'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Today's Summary */}
      {todaySummary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-blue-900">{todaySummary.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Present</p>
                <p className="text-3xl font-bold text-green-900">{todaySummary.present}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Absent</p>
                <p className="text-3xl font-bold text-red-900">{todaySummary.absent}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">Late</p>
                <p className="text-3xl font-bold text-yellow-900">{todaySummary.late}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Not Marked</p>
                <p className="text-3xl font-bold text-gray-900">{todaySummary.notMarked}</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Mark Attendance Section */}
      <Card className="mb-6">
        <h3 className="text-gray-900 mb-4">Mark Today's Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Student Name</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.filter(s => s.status === 'active').map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{student.email}</td>
                  <td className="py-3 px-4">
                    <StatusChip status={student.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(student.id, 'present')}
                        disabled={marking === student.id}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, 'absent')}
                        disabled={marking === student.id}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Absent
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, 'late')}
                        disabled={marking === student.id}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-yellow-600 transition-colors disabled:opacity-50"
                      >
                        <Clock className="w-4 h-4" />
                        Late
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <h3 className="text-gray-900 mb-4">Attendance Summary & Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Student Name</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                <th className="text-center py-3 px-4 text-sm text-gray-600">Total Days</th>
                <th className="text-center py-3 px-4 text-sm text-gray-600">Present</th>
                <th className="text-center py-3 px-4 text-sm text-gray-600">Absent</th>
                <th className="text-center py-3 px-4 text-sm text-gray-600">Late</th>
                <th className="text-center py-3 px-4 text-sm text-gray-600">Percentage</th>
                <th className="text-center py-3 px-4 text-sm text-gray-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{summary.studentName}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{summary.studentEmail}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-center font-medium">{summary.totalDays}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      {summary.presentDays}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      <XCircle className="w-3 h-3" />
                      {summary.absentDays}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      <Clock className="w-3 h-3" />
                      {summary.lateDays}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-lg font-bold ${getPercentageColor(summary.percentage)}`}>
                      {summary.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getPercentageIcon(summary.percentage)}
                      <span className={`text-sm font-medium ${getPercentageColor(summary.percentage)}`}>
                        {summary.percentage >= 80 ? 'Excellent' : summary.percentage >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📊 Automatic Email Notifications</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Students with <strong>&lt; 80% attendance</strong> receive a <span className="text-red-600 font-medium">warning email</span></li>
            <li>• Students with <strong>≥ 80% attendance</strong> receive a <span className="text-green-600 font-medium">congratulations email</span></li>
            <li>• Click "Send Notifications" button above to trigger emails for all students</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
