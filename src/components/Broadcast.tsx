import { useState, useEffect } from 'react';
import { Send, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface GmailStatus {
  connected: boolean;
  user?: {
    email: string;
    name: string;
  };
}

export function Broadcast() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false });

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students');
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

  const fetchGmailStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gmail/status');
      const result = await response.json();
      setGmailStatus(result);
    } catch (error) {
      console.error('Error fetching Gmail status:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchGmailStatus();
    const interval = setInterval(fetchGmailStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const eligibleStudents = students.filter(s => s.status === 'active' && s.email);

  const handleSelectAll = () => {
    if (selectedStudents.length === eligibleStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(eligibleStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    if (!gmailStatus.connected) {
      alert('Gmail is not connected');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, studentIds: selectedStudents }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Broadcast sent successfully!');
        setSubject('');
        setMessage('');
        setSelectedStudents([]);
      } else {
        alert('Failed: ' + result.error);
      }
    } catch (error) {
      alert('Error sending broadcast');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gmail Broadcast</h1>
        <p className="text-gray-600">Send emails to multiple students</p>
      </div>

      {!gmailStatus.connected && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Gmail Not Connected</h3>
              <p className="text-sm text-yellow-700">Connect Gmail from Dashboard first</p>
            </div>
          </div>
        </Card>
      )}

      {gmailStatus.connected && gmailStatus.user && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Gmail Connected</h3>
              <p className="text-sm text-green-700">Connected as: {gmailStatus.user.email}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Compose Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message..."
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Students</h3>
              <Button variant="secondary" onClick={handleSelectAll}>
                {selectedStudents.length === eligibleStudents.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-3">
              {students.map((student) => {
                const isEligible = student.status === 'active' && student.email;
                const isSelected = selectedStudents.includes(student.id);
                return (
                  <label
                    key={student.id}
                    className={'flex items-center p-4 border rounded-lg cursor-pointer ' + (!isEligible ? 'opacity-50' : isSelected ? 'border-blue-500 bg-blue-50' : '')}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleStudent(student.id)}
                      disabled={!isEligible}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email || 'No email'}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Send Broadcast</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <div>Recipients: {selectedStudents.length}</div>
                <div>Subject: {subject || 'Not set'}</div>
                <div className={gmailStatus.connected ? 'text-green-600' : 'text-red-600'}>
                  Gmail: {gmailStatus.connected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              <Button 
                onClick={handleSend} 
                disabled={sending || !gmailStatus.connected || selectedStudents.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send to ' + selectedStudents.length + ' Students'}
              </Button>
            </div>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Gmail Integration</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Professional emails</li>
                  <li>Active students only</li>
                  <li>All activity logged</li>
                </ul>
                {gmailStatus.connected && gmailStatus.user && (
                  <div className="mt-3 p-2 bg-white rounded text-xs">
                    <p className="text-gray-600">Connected:</p>
                    <p className="font-medium">{gmailStatus.user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
