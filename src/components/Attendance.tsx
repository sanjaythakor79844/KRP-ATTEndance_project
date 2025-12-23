import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusChip } from './ui/StatusChip';
import { AttendanceDetails } from './AttendanceDetails';
import { Send, Eye, X, Edit2 } from 'lucide-react';

export function Attendance() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [formData, setFormData] = useState({
    className: '',
    date: '2025-12-20',
    time: '09:00',
    manager: ''
  });

  const upcomingTriggers = [
    {
      className: 'Advanced Makeup Techniques',
      date: '2025-12-18',
      time: '09:00',
      manager: 'Rahul (123456789)',
      status: 'scheduled',
    },
    {
      className: 'Bridal Makeup Basics',
      date: '2025-12-19',
      time: '10:00',
      manager: 'Priya (987654321)',
      status: 'scheduled',
    },
    {
      className: 'Hair Styling Workshop',
      date: '2025-12-20',
      time: '14:00',
      manager: 'Rahul (123456789)',
      status: 'sent',
    },
  ];

  const recentSubmissions = [
    {
      date: '2025-12-15',
      className: 'Foundation & Contouring',
      manager: 'Rahul',
      totalAttended: 18,
      status: 'submitted',
    },
    {
      date: '2025-12-14',
      className: 'Eyebrow Shaping',
      manager: 'Priya',
      totalAttended: 22,
      status: 'submitted',
    },
    {
      date: '2025-12-13',
      className: 'Color Theory',
      manager: 'Rahul',
      totalAttended: 15,
      status: 'pending',
    },
  ];

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Attendance Management</h2>
        <p className="text-gray-600">Manage attendance triggers and view submissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-gray-900 mb-6">Create Attendance Trigger</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Class Name</label>
                <select 
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a class</option>
                  <option value="Advanced Makeup Techniques">Advanced Makeup Techniques</option>
                  <option value="Bridal Makeup Basics">Bridal Makeup Basics</option>
                  <option value="Foundation & Contouring">Foundation & Contouring</option>
                  <option value="Hair Styling Workshop">Hair Styling Workshop</option>
                  <option value="Color Theory">Color Theory</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Date to Send</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Time to Send</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Send To (Telegram)</label>
                <select 
                  value={formData.manager}
                  onChange={(e) => setFormData({...formData, manager: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select attendance manager</option>
                  <option value="Rahul (123456789)">Rahul (Attendance Manager) — 123456789</option>
                  <option value="Priya (987654321)">Priya (Attendance Manager) — 987654321</option>
                  <option value="Amit (456789123)">Amit (Attendance Manager) — 456789123</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  icon={Send}
                  onClick={() => {
                    if (!formData.className || !formData.manager) {
                      alert('Please select a class and attendance manager');
                      return;
                    }
                    alert(`Attendance trigger scheduled!\n\nClass: ${formData.className}\nDate: ${formData.date}\nTime: ${formData.time}\nManager: ${formData.manager}\n\nThe attendance message will be sent to the manager on Telegram at the scheduled time.`);
                    setFormData({ className: '', date: '2025-12-20', time: '09:00', manager: '' });
                  }}
                >
                  Send to Attendance Manager
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setFormData({ className: '', date: '2025-12-20', time: '09:00', manager: '' })}
                >
                  Reset
                </Button>
              </div>

              <p className="text-xs text-gray-500 pt-2">
                This will send an attendance message on Telegram to the selected Attendance Manager.
              </p>
            </div>
          </Card>
        </div>

        {/* Telegram Preview */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-gray-900 mb-4">Telegram Message Preview</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-900 mb-3">
                📋 Attendance check for <strong>Advanced Makeup Techniques</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Date: <strong>December 20, 2025</strong>
              </p>
              <p className="text-sm text-gray-700 mb-3">Please reply with:</p>
              <ol className="text-sm text-gray-700 mb-4 space-y-1 ml-4 list-decimal">
                <li>Total attended</li>
                <li>Present student names</li>
                <li>Absent student names</li>
              </ol>
              <button 
                onClick={() => {
                  alert('✅ Attendance Submitted!\n\nThis button would normally open a form for the attendance manager to submit attendance details via Telegram.');
                }}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <span>✅</span>
                <span>Submit Attendance</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Triggers Table */}
      <Card className="mb-6">
        <h3 className="text-gray-900 mb-4">Upcoming Attendance Triggers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Class Name</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Scheduled Date</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Scheduled Time</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Attendance Manager</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTriggers.map((trigger, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{trigger.className}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{trigger.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{trigger.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{trigger.manager}</td>
                  <td className="py-3 px-4">
                    <StatusChip status={trigger.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedRecord(trigger);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to edit this trigger for ${trigger.className}?`)) {
                            setFormData({
                              className: trigger.className,
                              date: trigger.date,
                              time: trigger.time,
                              manager: trigger.manager
                            });
                            alert('Trigger loaded into form for editing. Update the details and click "Send to Attendance Manager" to save changes.');
                          }
                        }}
                        className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cancel the attendance trigger for ${trigger.className}?`)) {
                            alert(`Attendance trigger for ${trigger.className} has been cancelled.`);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Submissions Table */}
      <Card>
        <h3 className="text-gray-900 mb-4">Recent Attendance Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Class Name</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Attendance Manager</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Total Attended</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((submission, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{submission.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{submission.className}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{submission.manager}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{submission.totalAttended}</td>
                  <td className="py-3 px-4">
                    <StatusChip status={submission.status} />
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleViewDetails(submission)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showDetails && (
        <AttendanceDetails
          record={selectedRecord}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
