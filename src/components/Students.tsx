import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { Card } from './ui/Card';
import { API_BASE_URL } from '../config';
import Papa from 'papaparse';

interface Student {
  id: string;
  name: string;
  email: string;
  assignmentLimit: number;
  currentAssignments: number;
  status: 'active' | 'inactive';
}

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    assignmentLimit: 3,
    status: 'active' as 'active' | 'inactive',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{success: number; failed: number; errors: string[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch students from server
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students`);
      const result = await response.json();
      if (result.success) {
        setStudents(result.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing student
        const response = await fetch(`${API_BASE_URL}/api/students/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          alert('✅ Student updated successfully!');
          await fetchStudents();
          setEditingId(null);
        } else {
          alert(`❌ Failed to update student: ${result.error || 'Unknown error'}`);
          console.error('Update error:', result);
        }
      } else {
        // Add new student
        const response = await fetch(`${API_BASE_URL}/api/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          alert('✅ Student added successfully!');
          await fetchStudents();
        } else {
          alert(`❌ Failed to add student: ${result.error || 'Unknown error'}`);
          console.error('Add error:', result);
        }
      }
      
      // Reset form
      setFormData({ name: '', email: '', assignmentLimit: 3, status: 'active' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving student:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to save student'}`);
    }
  };

  const handleEdit = (student: Student) => {
    const { currentAssignments, ...rest } = student;
    setFormData(rest);
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('✅ Student deleted successfully!');
        await fetchStudents();
      } else {
        alert(`❌ Failed to delete student: ${result.error || 'Unknown error'}`);
        console.error('Delete error:', result);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to delete student'}`);
    }
  };

  // Handle CSV/Excel file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      alert('❌ Please upload a CSV or Excel file');
      return;
    }

    setImporting(true);
    setImportResults(null);

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
          // Validate required fields
          if (!row.name || !row.email) {
            errors.push(`Row ${i + 1}: Missing name or email`);
            failedCount++;
            continue;
          }

          try {
            const studentData = {
              name: row.name.trim(),
              email: row.email.trim().toLowerCase(),
              assignmentLimit: parseInt(row.assignmentLimit || row.assignment_limit || '3'),
              status: (row.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
            };

            // Add student via API
            const response = await fetch(`${API_BASE_URL}/api/students`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(studentData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
              successCount++;
            } else {
              errors.push(`Row ${i + 1} (${row.name}): ${result.error || 'Failed to add'}`);
              failedCount++;
            }
          } catch (error) {
            errors.push(`Row ${i + 1} (${row.name}): ${error instanceof Error ? error.message : 'Unknown error'}`);
            failedCount++;
          }
        }

        setImportResults({ success: successCount, failed: failedCount, errors });
        setImporting(false);
        await fetchStudents();

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        alert(`❌ Error parsing file: ${error.message}`);
        setImporting(false);
      }
    });
  };

  // Export students to CSV
  const handleExportCSV = () => {
    const csvData = students.map(student => ({
      name: student.name,
      email: student.email,
      assignmentLimit: student.assignmentLimit,
      currentAssignments: student.currentAssignments,
      status: student.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const sampleData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        assignmentLimit: 3,
        status: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        assignmentLimit: 5,
        status: 'active'
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-600 mt-2">Manage student information and assignment limits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 border border-gray-300"
            title="Download CSV Template"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Import Results */}
      {importResults && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Successfully Added</p>
                  <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                </div>
              </div>
              {importResults.errors.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                    {importResults.errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                    {importResults.errors.length > 10 && (
                      <li className="text-gray-500 italic">... and {importResults.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
              <button
                onClick={() => setImportResults(null)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Student Form */}
      {showForm && (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Student' : 'Add New Student'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.assignmentLimit}
                  onChange={(e) => setFormData({ ...formData, assignmentLimit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', email: '', assignmentLimit: 3, status: 'active' });
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Assignments</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                  <td className="py-3 px-4 text-gray-600">{student.email}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      student.currentAssignments >= student.assignmentLimit 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {student.currentAssignments}/{student.assignmentLimit}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
