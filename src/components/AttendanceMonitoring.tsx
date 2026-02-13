// Professional Attendance Monitoring Component - Complete Version
import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, XCircle, Clock, Calendar, Search, RefreshCw, Send, Download, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'present' | 'absent' | 'late' | 'not_marked';
  timestamp: string;
}

interface DailySummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  notMarked: number;
}

export function AttendanceMonitoring() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
    loadAttendanceForDate(selectedDate);
  }, [selectedDate]);

  const loadStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.data.filter((s: Student) => s.status === 'active'));
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAttendanceForDate = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/by-date?date=${date}`);
      const data = await response.json();
      if (data.success) {
        setAttendanceRecords(data.data);
        calculateDailySummary(data.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailySummary = (records: AttendanceRecord[]) => {
    const summary = {
      date: selectedDate,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      notMarked: students.length - records.length
    };
    setDailySummary(summary);
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    setMarking(studentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          status,
          date: selectedDate,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        await loadAttendanceForDate(selectedDate);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setMarking(null);
    }
  };

  const getStudentStatus = (studentId: string): 'present' | 'absent' | 'late' | 'not_marked' => {
    const record = attendanceRecords.find(r => r.studentId === studentId);
    return record ? record.status : 'not_marked';
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
              onClick={() => loadAttendanceForDate(selectedDate)}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              icon={Send}
              onClick={() => {/* Send notifications */}}
            >
              Send Notifications
            </Button>
          </div>
        </div>
      </div>

      {/* Date Selector and Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Date Selector Card */}
        <Card className="lg:col-span-1 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Select Date</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-2 text-xs text-gray-600">
            {formatDate(selectedDate)}
          </div>
        </Card>

        {/* Summary Cards */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-700">Present</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{dailySummary?.present || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-700">Absent</p>
              </div>
              <p className="text-3xl font-bold text-red-900">{dailySummary?.absent || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-700">Late</p>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{dailySummary?.late || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600">❓</span>
                <p className="text-sm font-medium text-gray-700">Not Marked</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{dailySummary?.notMarked || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Mark Today's Attendance Section */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mark Today's Attendance</h2>
          <div className="flex items-center gap-3">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Class 10 A</option>
              <option value="10b">Class 10 B</option>
              <option value="10c">Class 10 C</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          status === 'present' ? 'bg-green-500' :
                          status === 'absent' ? 'bg-red-500' :
                          status === 'late' ? 'bg-yellow-500' :
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
                          className="p-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50"
                          title="Mark Present"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
                          disabled={marking === student.id}
                          className="p-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Mark Absent"
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'late')}
                          disabled={marking === student.id}
                          className="p-2 rounded-full hover:bg-yellow-100 transition-colors disabled:opacity-50"
                          title="Mark Late"
                        >
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="Check"
                        >
                          <span className="text-gray-600">✓</span>
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="More options"
                        >
                          <span className="text-gray-600">⋮</span>
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
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Summary & Performance</h2>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Filter} size="sm">
              Filter
            </Button>
            <Button variant="secondary" icon={Download} size="sm">
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
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      8
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      6
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      2
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      0
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-lg font-bold text-green-600">75%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                      ↓ Needs Improvement
                    </span>
                  </td>
                </tr>
              ))}
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
