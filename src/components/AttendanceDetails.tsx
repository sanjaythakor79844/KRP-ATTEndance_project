import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { StatusChip } from './ui/StatusChip';

interface AttendanceDetailsProps {
  record: any;
  onClose: () => void;
}

export function AttendanceDetails({ record, onClose }: AttendanceDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900 mb-1">Attendance Details</h2>
            <p className="text-sm text-gray-600">{record?.className || 'Foundation & Contouring'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <p className="text-gray-900">{record?.date || '2025-12-15'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Attendance Manager</label>
              <p className="text-gray-900">{record?.manager || 'Rahul'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Total Attended</label>
              <p className="text-2xl text-gray-900">{record?.totalAttended || '18'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <StatusChip status={record?.status || 'submitted'} />
            </div>
          </div>

          {/* Present Students */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Present Students</label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <textarea
                readOnly
                className="w-full bg-transparent text-gray-900 text-sm resize-none focus:outline-none"
                rows={6}
                value={`Aarav Sharma
Diya Patel
Rohan Kumar
Priya Singh
Arjun Verma
Kavya Reddy
Ishaan Gupta
Ananya Nair
Vivaan Mehta
Saanvi Joshi
Aditya Rao
Riya Kapoor
Kabir Shah
Navya Desai
Dhruv Malhotra
Isha Agarwal
Aryan Pandey
Myra Iyer`}
              />
            </div>
          </div>

          {/* Absent Students */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Absent Students</label>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <textarea
                readOnly
                className="w-full bg-transparent text-gray-900 text-sm resize-none focus:outline-none"
                rows={4}
                value={`Vihaan Sharma
Kiara Patel
Aanya Kumar
Reyansh Singh`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="secondary">Edit & Save</Button>
        </div>
      </div>
    </div>
  );
}
