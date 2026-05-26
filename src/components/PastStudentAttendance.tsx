import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Card } from './ui/Card';
import { API_BASE_URL } from '../config';

interface PastStudentAttendanceProps {
  studentId: string;
  onBack: () => void;
}

interface MonthRow {
  month: string;
  monthLabel: string;
  totalClasses: number;
  classesAttended: number;
  classesMissed: number;
  attendancePercentage: number;
  status: string;
  dailyRecords?: { date: string; status: string; displayStatus: string }[];
}

interface TotalsRow {
  label: string;
  totalClasses: number;
  classesAttended: number;
  classesMissed: number;
  attendancePercentage: number;
  averageAttendancePercentage: number;
  status: string;
  monthCount: number;
}

interface TermSummary extends TotalsRow {
  firstMonth: string | null;
  lastMonth: string | null;
  firstMonthLabel: string | null;
  lastMonthLabel: string | null;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  batch?: string;
  deactivatedAt?: string;
}

function pctColor(pct: number): string {
  if (pct >= 75) return 'text-green-600 bg-green-50';
  if (pct >= 60) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

function statusBadge(status: string): string {
  if (status === 'Good') return 'bg-green-100 text-green-800';
  if (status === 'Average') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function PastStudentAttendance({ studentId, onBack }: PastStudentAttendanceProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [rangeTotals, setRangeTotals] = useState<TotalsRow | null>(null);
  const [termSummary, setTermSummary] = useState<TermSummary | null>(null);
  const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [quickMonth, setQuickMonth] = useState('');
  const [filterMode, setFilterMode] = useState<'default' | 'range' | 'term'>('default');
  const [appliedChip, setAppliedChip] = useState('Last 6 months');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMode === 'term') {
        params.set('filter', 'term');
      } else if (filterMode === 'range') {
        if (fromMonth) params.set('from_month', fromMonth);
        if (toMonth) params.set('to_month', toMonth);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/records/students/${studentId}/attendance/summary?${params}`
      );
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        setStudent(data.student);
        setMonths(data.months || []);
        setRangeTotals(data.rangeTotals);
        setTermSummary(data.termSummary);
        setAvailableMonths(data.availableMonths || []);
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, filterMode, fromMonth, toMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleApplyFilter = () => {
    if (quickMonth) {
      setFromMonth(quickMonth);
      setToMonth(quickMonth);
      setFilterMode('range');
      const label = availableMonths.find((m) => m.value === quickMonth)?.label || quickMonth;
      setAppliedChip(label);
    } else if (fromMonth || toMonth) {
      setFilterMode('range');
      const fromLabel =
        availableMonths.find((m) => m.value === fromMonth)?.label || fromMonth || 'Start';
      const toLabel = availableMonths.find((m) => m.value === toMonth)?.label || toMonth || 'End';
      setAppliedChip(`${fromLabel} — ${toLabel}`);
    } else {
      setFilterMode('default');
      setAppliedChip('Last 6 months');
    }
  };

  const handleTermFilter = () => {
    setFilterMode('term');
    setFromMonth('');
    setToMonth('');
    setQuickMonth('');
    if (termSummary?.firstMonthLabel && termSummary?.lastMonthLabel) {
      setAppliedChip(`Full Term: ${termSummary.firstMonthLabel} — ${termSummary.lastMonthLabel}`);
    } else {
      setAppliedChip('Full Term');
    }
  };

  const handleClearFilter = () => {
    setFromMonth('');
    setToMonth('');
    setQuickMonth('');
    setFilterMode('default');
    setAppliedChip('Last 6 months');
  };

  useEffect(() => {
    if (filterMode === 'term' && termSummary?.firstMonthLabel) {
      setAppliedChip(`Full Term: ${termSummary.firstMonthLabel} — ${termSummary.lastMonthLabel}`);
    }
  }, [filterMode, termSummary]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <nav className="text-sm text-gray-500 mb-4">
        <button onClick={onBack} className="hover:text-indigo-600">
          Dashboard
        </button>
        <span className="mx-2">›</span>
        <button onClick={onBack} className="hover:text-indigo-600">
          Records
        </button>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">{student?.name || 'Student'}</span>
      </nav>

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Past Records
      </button>

      {student && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Student</p>
              <p className="text-lg font-semibold text-gray-900">{student.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
              <p className="text-gray-900">{student.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Batch / Year</p>
              <p className="text-gray-900">{student.batch || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Deactivated</p>
              <p className="text-gray-900">{formatDate(student.deactivatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-gray-900">{student.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="text-gray-900">{student.phone || '—'}</p>
            </div>
          </div>
        </Card>
      )}

      {termSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="border-indigo-200 bg-indigo-50/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Full Term Attendance</p>
                <p className="text-3xl font-bold text-indigo-700 mt-1">
                  {termSummary.attendancePercentage}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {termSummary.firstMonthLabel} — {termSummary.lastMonthLabel} (
                  {termSummary.monthCount} months)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-indigo-200">
              <div>
                <p className="text-xs text-gray-500">Total Classes</p>
                <p className="text-lg font-semibold">{termSummary.totalClasses}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Attended</p>
                <p className="text-lg font-semibold text-green-600">{termSummary.classesAttended}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Missed</p>
                <p className="text-lg font-semibold text-red-600">{termSummary.classesMissed}</p>
              </div>
            </div>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Range</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {rangeTotals?.attendancePercentage ?? 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{appliedChip}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-purple-200">
              <div>
                <p className="text-xs text-gray-500">Total Classes</p>
                <p className="text-lg font-semibold">{rangeTotals?.totalClasses ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Attended</p>
                <p className="text-lg font-semibold text-green-600">
                  {rangeTotals?.classesAttended ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Missed</p>
                <p className="text-lg font-semibold text-red-600">
                  {rangeTotals?.classesMissed ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Attendance Filters</h3>
          <span className="ml-auto text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {appliedChip}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Month</label>
            <input
              type="month"
              value={fromMonth}
              onChange={(e) => {
                setFromMonth(e.target.value);
                setQuickMonth('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Month</label>
            <input
              type="month"
              value={toMonth}
              onChange={(e) => {
                setToMonth(e.target.value);
                setQuickMonth('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quick Month</label>
            <select
              value={quickMonth}
              onChange={(e) => setQuickMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select month...</option>
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <button
              onClick={handleApplyFilter}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Apply Filter
            </button>
            <button
              onClick={handleTermFilter}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
            >
              Full Term
            </button>
            <button
              onClick={handleClearFilter}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear / Reset
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Attendance Summary</h3>
        <p className="text-xs text-gray-500 mb-4 italic">Read-only archived records</p>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading attendance summary...</div>
        ) : months.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No attendance records for this period</div>
        ) : (
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-700 w-8"></th>
                  <th className="text-left py-3 px-3 font-medium text-gray-700">Month</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-700">Total Classes</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-700">Attended</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-700">Missed</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-700">Attendance %</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row, index) => (
                  <Fragment key={row.month}>
                    <tr
                      key={row.month}
                      className={`border-b border-gray-100 ${
                        index % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        {row.dailyRecords && row.dailyRecords.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedMonth(expandedMonth === row.month ? null : row.month)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedMonth === row.month ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium">{row.monthLabel}</td>
                      <td className="py-2 px-3 text-right">{row.totalClasses}</td>
                      <td className="py-2 px-3 text-right text-green-600">{row.classesAttended}</td>
                      <td className="py-2 px-3 text-right text-red-600">{row.classesMissed}</td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-medium ${pctColor(
                            row.attendancePercentage
                          )}`}
                        >
                          {row.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusBadge(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                    {expandedMonth === row.month && row.dailyRecords && (
                      <tr key={`${row.month}-detail`} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {row.dailyRecords.map((d) => (
                              <div
                                key={d.date}
                                className="text-xs bg-white border rounded px-2 py-1.5"
                              >
                                <p className="font-medium text-gray-700">
                                  {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                                <p
                                  className={
                                    d.status === 'present' || d.status === 'late'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }
                                >
                                  {d.displayStatus}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
              {rangeTotals && (
                <tfoot className="sticky bottom-0 bg-gray-100 border-t-2 border-gray-300">
                  <tr className="font-bold">
                    <td className="py-3 px-3" colSpan={2}>
                      {rangeTotals.label}
                    </td>
                    <td className="py-3 px-3 text-right">{rangeTotals.totalClasses}</td>
                    <td className="py-3 px-3 text-right text-green-700">
                      {rangeTotals.classesAttended}
                    </td>
                    <td className="py-3 px-3 text-right text-red-700">
                      {rangeTotals.classesMissed}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${pctColor(
                          rangeTotals.attendancePercentage
                        )}`}
                      >
                        {rangeTotals.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusBadge(
                          rangeTotals.status
                        )}`}
                      >
                        {rangeTotals.status}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
