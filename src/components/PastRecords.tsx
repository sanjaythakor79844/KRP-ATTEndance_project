// Past Student Records Component - Complete Implementation
import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Search, Calendar, TrendingUp, TrendingDown, ArrowLeft, Download, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface PastStudent {
  id: string;
  name: string;
  email: string;
  batch: string;
  deactivatedAt: string;
}

interface MonthlyAttendance {
  month: string;
  monthName: string;
  totalClasses: number;
  classesAttended: number;
  classesMissed: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  status: string;
}

interface TotalTermStats {
  firstMonth: string;
  lastMonth: string;
  totalClasses: number;
  totalAttended: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalPercentage: number;
  avgMonthlyPercentage: number;
  status: string;
}

interface AttendanceSummary {
  student: PastStudent;
  monthlySummary: MonthlyAttendance[];
  totalTerm: TotalTermStats;
}

const EMPTY_TOTAL_TERM: TotalTermStats = {
  firstMonth: 'N/A',
  lastMonth: 'N/A',
  totalClasses: 0,
  totalAttended: 0,
  totalPresent: 0,
  totalAbsent: 0,
  totalLate: 0,
  totalPercentage: 0,
  avgMonthlyPercentage: 0,
  status: 'Low',
};

function normalizeSummary(raw: Record<string, unknown> | null): AttendanceSummary | null {
  if (!raw || !raw.student) return null;

  const student = raw.student as PastStudent;
  const term = (raw.totalTerm || raw.termSummary) as Record<string, unknown> | undefined;

  const monthlySummary: MonthlyAttendance[] = (
    (raw.monthlySummary as MonthlyAttendance[]) ||
    ((raw.months as Record<string, unknown>[]) || []).map((m) => ({
      month: String(m.month || ''),
      monthName: String(m.monthName || m.monthLabel || m.month || ''),
      totalClasses: Number(m.totalClasses) || 0,
      classesAttended: Number(m.classesAttended) || 0,
      classesMissed: Number(m.classesMissed) || 0,
      present: Number(m.present) || 0,
      absent: Number(m.absent) || 0,
      late: Number(m.late) || 0,
      percentage: Number(m.percentage ?? m.attendancePercentage) || 0,
      status: String(m.status || 'Low'),
    }))
  );

  const totalTerm: TotalTermStats = term
    ? {
        firstMonth: String(term.firstMonth ?? term.firstMonthLabel ?? 'N/A'),
        lastMonth: String(term.lastMonth ?? term.lastMonthLabel ?? 'N/A'),
        totalClasses: Number(term.totalClasses) || 0,
        totalAttended: Number(term.totalAttended ?? term.classesAttended) || 0,
        totalPresent: Number(term.totalPresent) || 0,
        totalAbsent: Number(term.totalAbsent ?? term.classesMissed) || 0,
        totalLate: Number(term.totalLate) || 0,
        totalPercentage: Number(term.totalPercentage ?? term.attendancePercentage) || 0,
        avgMonthlyPercentage: Number(term.avgMonthlyPercentage ?? term.averageAttendancePercentage) || 0,
        status: String(term.status || 'Low'),
      }
    : { ...EMPTY_TOTAL_TERM };

  return { student, monthlySummary, totalTerm };
}

export function PastRecords() {
  const [students, setStudents] = useState<PastStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<PastStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PastStudent | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // Filter states
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPastStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.batch.toLowerCase().includes(term)
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const loadPastStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/records/students`);
      if (!response.ok) {
        console.error('Past students API error:', response.status);
        setStudents([]);
        setFilteredStudents([]);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setStudents(data.data || []);
        setFilteredStudents(data.data || []);
      }
    } catch (error) {
      console.error('Error loading past students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async (studentId: string) => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      let url = `${API_BASE_URL}/api/records/students/${studentId}/attendance/summary`;
      const params = new URLSearchParams();
      if (fromMonth) params.append('from_month', fromMonth);
      if (toMonth) params.append('to_month', toMonth);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setAttendanceSummary(null);
        setSummaryError(
          data.error ||
            (response.status === 404
              ? 'Past records API not found. Deploy the latest backend to Render.'
              : 'Failed to load attendance summary.')
        );
        return;
      }

      const normalized = normalizeSummary(data.data);
      if (!normalized) {
        setAttendanceSummary(null);
        setSummaryError('Invalid attendance data received from server.');
        return;
      }
      setAttendanceSummary(normalized);
    } catch (error) {
      console.error('Error loading attendance summary:', error);
      setAttendanceSummary(null);
      setSummaryError('Network error loading attendance summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleViewAttendance = (student: PastStudent) => {
    setSelectedStudent(student);
    loadAttendanceSummary(student.id);
  };

  const handleBack = () => {
    setSelectedStudent(null);
    setAttendanceSummary(null);
    setSummaryError(null);
    setFromMonth('');
    setToMonth('');
    setShowFilters(false);
  };

  const handleApplyFilter = () => {
    if (selectedStudent) {
      loadAttendanceSummary(selectedStudent.id);
    }
  };

  const handleClearFilter = () => {
    setFromMonth('');
    setToMonth('');
    if (selectedStudent) {
      loadAttendanceSummary(selectedStudent.id);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Student List View
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            📚 Past Student Records
          </h1>
          <p className="text-sm text-gray-600">
            View archived attendance records for deactivated students
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </Card>

        {/* Students Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deactivated On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading past students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No students found matching your search' : 'No past students found'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {student.batch ? `Batch ${student.batch}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.deactivatedAt ? formatDate(student.deactivatedAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="secondary"
                          onClick={() => handleViewAttendance(student)}
                          className="text-xs"
                        >
                          View Attendance
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Attendance Detail View
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          icon={ArrowLeft}
          variant="secondary"
          onClick={handleBack}
          className="mb-4"
        >
          Back to Past Students
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {attendanceSummary?.student.name}
            </h1>
            <p className="text-sm text-gray-600">
              Batch {attendanceSummary?.student.batch} • {attendanceSummary?.student.email}
            </p>
          </div>
          <Button
            icon={Filter}
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Month
              </label>
              <input
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Month
              </label>
              <input
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilter} className="flex-1">
                Apply Filter
              </Button>
              <Button variant="secondary" onClick={handleClearFilter}>
                Clear
              </Button>
            </div>
          </div>
          {(fromMonth || toMonth) && (
            <div className="mt-3 text-sm text-gray-600">
              Showing: {fromMonth || 'Start'} to {toMonth || 'End'}
            </div>
          )}
        </Card>
      )}

      {loadingSummary ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            Loading attendance summary...
          </div>
        </Card>
      ) : summaryError ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 font-medium mb-2">{summaryError}</p>
            <p className="text-sm text-gray-500">
              Ensure the student is deactivated and the backend on Render has the latest code.
            </p>
          </div>
        </Card>
      ) : attendanceSummary?.totalTerm ? (
        <>
          {/* TOTAL TERM STATISTICS - NEW FEATURE */}
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Total Term Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Term Period</div>
                <div className="text-lg font-bold text-gray-900">
                  {attendanceSummary.totalTerm.firstMonth}
                </div>
                <div className="text-xs text-gray-500">to</div>
                <div className="text-lg font-bold text-gray-900">
                  {attendanceSummary.totalTerm.lastMonth}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Classes</div>
                <div className="text-3xl font-bold text-gray-900">
                  {attendanceSummary.totalTerm.totalClasses}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Throughout term
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Classes Attended</div>
                <div className="text-3xl font-bold text-green-600">
                  {attendanceSummary.totalTerm.totalAttended}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Present: {attendanceSummary.totalTerm.totalPresent} • Late: {attendanceSummary.totalTerm.totalLate}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Classes Missed</div>
                <div className="text-3xl font-bold text-red-600">
                  {attendanceSummary.totalTerm.totalAbsent}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Absent days
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Total Term Attendance %
                  </div>
                  {attendanceSummary.totalTerm.totalPercentage >= 75 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className={`text-4xl font-bold ${getPercentageColor(attendanceSummary.totalTerm.totalPercentage)} px-4 py-2 rounded-lg inline-block`}>
                  {attendanceSummary.totalTerm.totalPercentage}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  First to last month record
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Average Monthly Attendance %
                  </div>
                  {attendanceSummary.totalTerm.avgMonthlyPercentage >= 75 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className={`text-4xl font-bold ${getPercentageColor(attendanceSummary.totalTerm.avgMonthlyPercentage)} px-4 py-2 rounded-lg inline-block`}>
                  {attendanceSummary.totalTerm.avgMonthlyPercentage}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Average across all months
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Attendance Summary */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Monthly Attendance Breakdown
              </h2>
              <Button icon={Download} variant="secondary" className="text-xs">
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Classes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attended
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Missed
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(attendanceSummary.monthlySummary || []).map((month) => (
                    <tr key={month.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month.monthName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {month.totalClasses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                        {month.classesAttended}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                        {month.classesMissed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(month.percentage)}`}>
                          {month.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          month.status === 'Good' ? 'bg-green-100 text-green-800' :
                          month.status === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {month.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* TOTAL ROW */}
                  <tr className="bg-blue-50 font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      TOTAL TERM
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {attendanceSummary.totalTerm.totalClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                      {attendanceSummary.totalTerm.totalAttended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                      {attendanceSummary.totalTerm.totalAbsent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(attendanceSummary.totalTerm.totalPercentage)}`}>
                        {attendanceSummary.totalTerm.totalPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendanceSummary.totalTerm.status === 'Good' ? 'bg-green-100 text-green-800' :
                        attendanceSummary.totalTerm.status === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {attendanceSummary.totalTerm.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500">
            No attendance data available
          </div>
        </Card>
      )}
    </div>
  );
}
