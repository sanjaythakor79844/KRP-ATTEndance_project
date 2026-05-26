import { useState, useEffect, useCallback } from 'react';
import { Search, X, Archive, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/Card';
import { API_BASE_URL } from '../config';

export interface PastStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  batch?: string;
  status: string;
  deactivatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PastRecordsProps {
  onViewAttendance: (studentId: string) => void;
}

export function PastRecords({ onViewAttendance }: PastRecordsProps) {
  const [students, setStudents] = useState<PastStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPastStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: debouncedSearch,
      });
      const response = await fetch(`${API_BASE_URL}/api/records/students?${params}`);
      const result = await response.json();
      if (result.success) {
        setStudents(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching past students:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchPastStudents();
  }, [fetchPastStudents]);

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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Archive className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Past Student Records</h1>
            <p className="text-gray-600 text-sm">
              Archived attendance histories for deactivated students (read-only)
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading past student records...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center">
            <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No records found</p>
            <p className="text-gray-500 text-sm mt-1">
              {debouncedSearch
                ? 'Try a different search term'
                : 'Deactivated students will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Batch / Year</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Deactivated</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.id}</td>
                      <td className="py-3 px-4 text-gray-600">{student.batch || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.email || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(student.deactivatedAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onViewAttendance(student.id)}
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Attendance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of{' '}
                  {pagination.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
