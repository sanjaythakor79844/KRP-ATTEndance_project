import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  telegramId: string;
  eligible: boolean;
  reason?: string;
}

export function Broadcast() {
  const [students] = useState<Student[]>([
    { id: '1', name: 'Alice Johnson', telegramId: '@alice_j', eligible: true },
    { id: '2', name: 'Bob Smith', telegramId: '@bob_smith', eligible: false, reason: 'Limit reached (3/3)' },
    { id: '3', name: 'Carol White', telegramId: '@carol_w', eligible: true },
    { id: '4', name: 'David Lee', telegramId: '@david_lee', eligible: false, reason: 'Status: Inactive' },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const eligibleStudents = students.filter((s) => s.eligible);

  const handleSelectAll = () => {
    if (selectedStudents.length === eligibleStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(eligibleStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((sid) => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSend = () => {
    if (selectedStudents.length === 0 || !selectedTemplate) {
      alert('Please select a template and at least one student');
      return;
    }
    alert(`Broadcast sent to ${selectedStudents.length} student(s) using template: ${selectedTemplate}`);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
        <p className="text-sm text-gray-600 mt-2">Send messages to eligible students via Telegram</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-xl">👥</span>
                Eligible Students
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedStudents.length === eligibleStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`px-4 py-3 flex items-center justify-between ${
                    !student.eligible ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                      disabled={!student.eligible}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.telegramId}</div>
                    </div>
                  </div>
                  {!student.eligible && (
                    <span className="text-xs text-gray-500 italic">{student.reason}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Broadcast Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a template</option>
                  <option value="new_assignment">New Assignment</option>
                  <option value="reminder">Reminder</option>
                  <option value="welcome">Welcome Message</option>
                </select>
              </div>

              <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-900">
                    <p className="mb-2 font-semibold text-blue-600">📊 Selection Summary</p>
                    <p className="mb-1">✅ Selected: <strong>{selectedStudents.length}</strong> students</p>
                    <p>👤 Eligible: <strong>{eligibleStudents.length}</strong> students</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={selectedStudents.length === 0 || !selectedTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
