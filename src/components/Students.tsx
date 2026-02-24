import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { API_BASE_URL } from '../config';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
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

  // Handle file selection (preview only, don't import yet)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      alert('❌ Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setSelectedFile(file);
    setImportResults(null);

    // Preview the file data
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows
        } catch (error) {
          alert(`❌ Error reading Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 5, // Only preview first 5 rows
        complete: (results) => {
          setPreviewData(results.data);
        },
        error: (error) => {
          alert(`❌ Error parsing CSV file: ${error.message}`);
        }
      });
    }
  };

  // Handle actual import when user clicks Import button
  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    setImporting(true);
    setImportResults(null);

    // Handle Excel files (.xlsx, .xls)
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          await processImportData(jsonData);
        } catch (error) {
          alert(`❌ Error reading Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setImporting(false);
        }
      };
      
      reader.onerror = () => {
        alert('❌ Error reading file');
        setImporting(false);
      };
      
      reader.readAsBinaryString(selectedFile);
    } 
    // Handle CSV files
    else {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processImportData(results.data);
        },
        error: (error) => {
          alert(`❌ Error parsing CSV file: ${error.message}`);
          setImporting(false);
        }
      });
    }
  };

  // Cancel file selection
  const handleCancelImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process imported data (common for both CSV and Excel)
  const processImportData = async (data: any[]) => {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Validate required fields (support multiple column name formats)
      const name = row.name || row.Name || row.NAME || row['Student Name'] || row['student_name'];
      const email = row.email || row.Email || row.EMAIL || row['Email Address'] || row['email_address'];
      
      if (!name || !email) {
        errors.push(`Row ${i + 1}: Missing name or email`);
        failedCount++;
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${i + 1} (${name}): Invalid email format`);
        failedCount++;
        continue;
      }

      try {
        const studentData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          assignmentLimit: parseInt(
            row.assignmentLimit || 
            row.assignment_limit || 
            row['Assignment Limit'] || 
            row.limit || 
            '3'
          ),
          status: (
            (row.status || row.Status || row.STATUS || 'active')
              .toLowerCase() === 'inactive' ? 'inactive' : 'active'
          ) as 'active' | 'inactive',
        };

        // Validate assignment limit
        if (isNaN(studentData.assignmentLimit) || studentData.assignmentLimit < 1) {
          studentData.assignmentLimit = 3;
        }

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
          errors.push(`Row ${i + 1} (${name}): ${result.error || 'Failed to add'}`);
          failedCount++;
        }
      } catch (error) {
        errors.push(`Row ${i + 1} (${name}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        failedCount++;
      }
    }

    setImportResults({ success: successCount, failed: failedCount, errors });
    setImporting(false);
    setSelectedFile(null);
    setPreviewData([]);
    await fetchStudents();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Show summary alert
    if (successCount > 0 || failedCount > 0) {
      const message = `Import Complete!\n\n✅ Successfully added: ${successCount}\n❌ Failed: ${failedCount}`;
      alert(message);
    }
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

  // Export students to Excel
  const handleExportExcel = () => {
    const excelData = students.map(student => ({
      'Name': student.name,
      'Email': student.email,
      'Assignment Limit': student.assignmentLimit,
      'Current Assignments': student.currentAssignments,
      'Status': student.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Auto-size columns
    const maxWidth = excelData.reduce((w, r) => Math.max(w, r.Name.length), 10);
    worksheet['!cols'] = [
      { wch: maxWidth },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 10 }
    ];
    
    XLSX.writeFile(workbook, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const sampleData = [
      {
        name: 'Dakshi Kocharekar',
        email: 'dakshikocharekar6@gmail.com',
        assignmentLimit: 5,
        status: 'active'
      },
      {
        name: 'Bhavna',
        email: 'bhavna@example.com',
        assignmentLimit: 3,
        status: 'active'
      },
      {
        name: 'Shafaq',
        email: 'shafaqsultana@hotmail.com',
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

  // Download sample Excel template
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'Name': 'Dakshi Kocharekar',
        'Email': 'dakshikocharekar6@gmail.com',
        'Assignment Limit': 5,
        'Status': 'active'
      },
      {
        'Name': 'Bhavna',
        'Email': 'bhavna@example.com',
        'Assignment Limit': 3,
        'Status': 'active'
      },
      {
        'Name': 'Shafaq',
        'Email': 'shafaqsultana@hotmail.com',
        'Assignment Limit': 5,
        'Status': 'active'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Auto-size columns
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 35 },
      { wch: 18 },
      { wch: 12 }
    ];
    
    XLSX.writeFile(workbook, 'students_template.xlsx');
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
            <p className="text-sm text-gray-600 mt-2">Import, export, and manage student information</p>
          </div>
        </div>
        
        {/* Main Action Buttons - Clean Layout */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Import Button - PRIMARY ACTION */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing || selectedFile !== null}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold text-base"
            title="Select CSV or Excel file to import students"
          >
            <Upload className="w-5 h-5" />
            {selectedFile ? 'File Selected' : 'Select File to Import'}
          </button>

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all"
            title="Export all students to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all"
            title="Export all students to Excel"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>

          {/* Add Student Button */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all ml-auto"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {/* Help Card with Template Downloads */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium mb-1">
                💡 Quick Import Guide
              </p>
              <p className="text-sm text-gray-600">
                Click "Import Students" button above to upload your CSV or Excel file. Need help? Download a template below.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-300 transition-all text-sm shadow-sm"
                title="Download CSV Template"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV Template
              </button>
              <button
                onClick={downloadSampleExcel}
                className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-300 transition-all text-sm shadow-sm"
                title="Download Excel Template"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File Preview and Import Confirmation */}
      {selectedFile && previewData.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">File Selected: {selectedFile.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Preview of first 5 rows - Click "Import Now" to add these students</p>
              </div>
              <button
                onClick={handleCancelImport}
                className="text-gray-500 hover:text-gray-700"
                title="Cancel"
              >
                ✕
              </button>
            </div>

            {/* Preview Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Email</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Assignment Limit</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => {
                    const name = row.name || row.Name || row.NAME || row['Student Name'] || row['student_name'];
                    const email = row.email || row.Email || row.EMAIL || row['Email Address'] || row['email_address'];
                    const limit = row.assignmentLimit || row.assignment_limit || row['Assignment Limit'] || row.limit || '3';
                    const status = row.status || row.Status || row.STATUS || 'active';
                    
                    return (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-gray-900">{name || '❌ Missing'}</td>
                        <td className="py-2 px-3 text-gray-600">{email || '❌ Missing'}</td>
                        <td className="py-2 px-3 text-gray-600">{limit}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                            status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Import Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Upload className="w-5 h-5" />
                {importing ? 'Importing...' : 'Import Now'}
              </button>
              <button
                onClick={handleCancelImport}
                disabled={importing}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

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
