// Complete Professional Attendance System - v4.0 - ALL FEATURES
import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusChip } from './ui/StatusChip';
import { CheckCircle, XCircle, Clock, Calendar, Search, RefreshCw, Send, Download, Filter, TrendingUp, TrendingDown, Mail } from 'lucide-react';
import { API_BASE_URL } from '../config';

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

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
}

interface AttendanceSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('Class 10 A');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [selectedManager, setSelectedManager] = useState('');

  // Automation settings
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [triggeringAuto, setTriggeringAuto] = useState(false);

  // Summary counts
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [notMarkedCount, setNotMarkedCount] = useState(0);

  useEffect(() => {
    loadStudents();
    loadManagers();
    loadAttendanceForDate(selectedDate);
    loadSummaries();
    loadAutomationSettings();
  }, []);

  useEffect(() => {
    loadAttendanceForDate(selectedDate);
  }, [selectedDate]);

  const loadStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students`);
      const data = await response.json();
      if (data.success) {
        const activeStudents = data.data.filter((s: Student) => s.status === 'active');
        setStudents(activeStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/managers`);
      const data = await response.json();
      if (data.success) {
        setManagers(data.data);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const loadAttendanceForDate = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/by-date?date=${date}`);
      const data = await response.json();
      if (data.success) {
        setAttendanceRecords(data.data);
        calculateCounts(data.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/all-summaries`);
      const data = await response.json();
      if (data.success) {
        setSummaries(data.data);
      }
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  const loadAutomationSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/attendance-automation`);
      const data = await response.json();
      if (data.success) {
        setAutoEnabled(data.data.enabled);
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
    }
  };

  const toggleAutomation = async () => {
    setLoadingSettings(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/attendance-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoEnabled })
      });

      const result = await response.json();
      if (result.success) {
        setAutoEnabled(!autoEnabled);
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
      alert('❌ Error updating settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const triggerAutoNotifications = async () => {
    setTriggeringAuto(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/trigger-auto-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error triggering notifications:', error);
      alert('❌ Error sending notifications');
    } finally {
      setTriggeringAuto(false);
    }
  };

  const calculateCounts = (records: AttendanceRecord[]) => {
    setPresentCount(records.filter(r => r.status === 'present').length);
    setAbsentCount(records.filter(r => r.status === 'absent').length);
    setLateCount(records.filter(r => r.status === 'late').length);
    setNotMarkedCount(students.length - records.length);
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    setMarking(studentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          status,
          date: selectedDate,
          className: selectedClass
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadAttendanceForDate(selectedDate);
        await loadSummaries();
      } else {
        alert(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setMarking(null);
    }
  };

  const sendNotifications = async () => {
    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/check-and-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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
      const response = await fetch(`${API_BASE_URL}/api/attendance/send-manager-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: selectedManager })
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

  const getStudentStatus = (studentId: string): 'present' | 'absent' | 'late' | 'not_marked' => {
    const record = attendanceRecords.find(r => r.studentId === studentId);
    return record ? record.status : 'not_marked';
  };

  const getStudentSummary = (studentId: string): AttendanceSummary | null => {
    return summaries.find(s => s.studentId === studentId) || null;
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excellent', color: 'text-green-600', icon: <TrendingUp className="w-4 h-4" /> };
    if (percentage >= 60) return { label: 'Good', color: 'text-yellow-600', icon: <TrendingUp className="w-4 h-4" /> };
    return { label: 'Needs Improvement', color: 'text-red-600', icon: <TrendingDown className="w-4 h-4" /> };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h1>
            <p className="text-sm text-gray-600">Track daily attendance of students and mark their performance.</p>
          </div>
          <div className="flex gap-3">
            <Button
              icon={RefreshCw}
              variant="secondary"
              onClick={() => {
                loadStudents();
                loadManagers();
                loadAttendanceForDate(selectedDate);
                loadSummaries();
              }}
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
      </div>

      {/* Send Reminder to Manager */}
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-purple-600" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Automatic Attendance Monitoring */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">🤖 Automatic Attendance Monitoring</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Auto Mode:</span>
                <button
                  onClick={toggleAutomation}
                  disabled={loadingSettings}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoEnabled ? 'bg-green-600' : 'bg-gray-300'
                  } ${loadingSettings ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${autoEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {autoEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Automatically send daily attendance performance reports to students at 9:00 AM. 
              Students with less than 80% attendance will receive reminder emails.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Schedule</p>
                <p className="text-sm font-semibold text-gray-900">⏰ Daily at 9:00 AM</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Threshold</p>
                <p className="text-sm font-semibold text-gray-900">📊 Below 80% attendance</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p className={`text-sm font-semibold ${autoEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {autoEnabled ? '✅ Active' : '⏸️ Paused'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                icon={Send}
                onClick={triggerAutoNotifications}
                disabled={triggeringAuto}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {triggeringAuto ? 'Sending...' : 'Send Now (Manual)'}
              </Button>
              <Button
                variant="secondary"
                onClick={loadAutomationSettings}
              >
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Date Selector and Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Date Selector Card */}
        <Card className="lg:col-span-1 bg-white shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Today</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="mt-2 text-xs text-gray-600">
            {formatDate(selectedDate)}
          </div>
        </Card>

        {/* Summary Cards */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-700">Present</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{presentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-700">Absent</p>
              </div>
              <p className="text-3xl font-bold text-red-900">{absentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-700">Late</p>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{lateCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600">❓</span>
                <p className="text-sm font-medium text-gray-700">Not Marked</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{notMarkedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Mark Today's Attendance Section */}
      <Card className="mb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mark Today's Attendance</h2>
          <div className="flex items-center gap-3">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Class 10 A">Class 10 A</option>
              <option value="Class 10 B">Class 10 B</option>
              <option value="Class 10 C">Class 10 C</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const status = getStudentStatus(student.id);
                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all ${
                          status === 'present' ? 'bg-green-500 shadow-green-200 shadow-lg' :
                          status === 'absent' ? 'bg-red-500 shadow-red-200 shadow-lg' :
                          status === 'late' ? 'bg-yellow-500 shadow-yellow-200 shadow-lg' :
                          'bg-gray-400'
                        }`}>
                          {status === 'present' && <CheckCircle className="w-5 h-5" />}
                          {status === 'absent' && <XCircle className="w-5 h-5" />}
                          {status === 'late' && <Clock className="w-5 h-5" />}
                          {status === 'not_marked' && '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      {status === 'present' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Present
                        </span>
                      )}
                      {status === 'absent' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Absent
                        </span>
                      )}
                      {status === 'late' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          Late
                        </span>
                      )}
                      {status === 'not_marked' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => markAttendance(student.id, 'present')}
                          disabled={marking === student.id}
                          className="p-2 rounded-full hover:bg-green-100 transition-all hover:scale-110 disabled:opacity-50"
                          title="Mark Present"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
                          disabled={marking === student.id}
                          className="p-2 rounded-full hover:bg-red-100 transition-all hover:scale-110 disabled:opacity-50"
                          title="Mark Absent"
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'late')}
                          disabled={marking === student.id}
                          className="p-2 rounded-full hover:bg-yellow-100 transition-all hover:scale-110 disabled:opacity-50"
                          title="Mark Late"
                        >
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition-all hover:scale-110"
                          title="Check"
                        >
                          <span className="text-gray-600 text-lg">✓</span>
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition-all hover:scale-110"
                          title="More options"
                        >
                          <span className="text-gray-600 text-lg">⋮</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Attendance Summary & Performance */}
      <Card className="shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Summary & Performance</h2>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Filter}>
              Filter
            </Button>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Days</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Present</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Absent</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Late</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Percentage</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const summary = getStudentSummary(student.id);
                const performance = summary ? getPerformanceLabel(summary.percentage) : getPerformanceLabel(0);
                
                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {summary?.totalDays || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {summary?.presentDays || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {summary?.absentDays || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {summary?.lateDays || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg font-bold ${performance.color}`}>
                        {summary ? `${summary.percentage.toFixed(0)}%` : '0%'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${performance.color}`}>
                        {performance.icon}
                        {performance.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tip */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <span className="text-blue-600 text-lg">💡</span>
          <p className="text-sm text-blue-800">
            Tip: You can quickly track your students' attendance & mark it by clicking the buttons. Performance labels are based on percentage of attendance.
          </p>
        </div>
      </Card>
    </div>
  );
}
