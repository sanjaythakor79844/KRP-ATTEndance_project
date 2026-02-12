import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Send, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Project {
  id: string;
  title: string;
  date: string;
  location: string;
  assistantsRequired: number;
  requirements?: string;
  status: 'active' | 'completed';
}

interface Student {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface ProjectResponse {
  id: string;
  timestamp: string;
  details: string;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [responses, setResponses] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from server
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Fetch students from server
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

  // Fetch project responses
  const fetchResponses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects/responses');
      const result = await response.json();
      if (result.success) {
        setResponses(result.data);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchStudents();
    fetchResponses();
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    assistantsRequired: 1,
    requirements: '',
    status: 'active' as 'active' | 'completed',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing project
        const response = await fetch(`http://localhost:5000/api/projects/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        if (result.success) {
          alert('✅ Project updated successfully!');
          fetchProjects(); // Reload projects
        } else {
          alert(`❌ Failed to update project: ${result.error}`);
        }
        setEditingId(null);
      } else {
        // Add new project
        const response = await fetch('http://localhost:5000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        if (result.success) {
          alert('✅ Project added successfully!');
          fetchProjects(); // Reload projects
        } else {
          alert(`❌ Failed to add project: ${result.error}`);
        }
      }
      
      setFormData({ title: '', date: '', location: '', assistantsRequired: 1, status: 'active' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('❌ Error saving project. Please try again.');
    }
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      date: project.date,
      location: project.location,
      assistantsRequired: project.assistantsRequired,
      requirements: project.requirements || '',
      status: project.status,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ Project deleted successfully!');
        fetchProjects(); // Reload projects
      } else {
        alert(`❌ Failed to delete project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('❌ Error deleting project. Please try again.');
    }
  };

  const handleSendProject = async () => {
    if (!selectedProject || selectedStudents.length === 0) {
      alert('Please select a project and at least one student');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/projects/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject,
          studentIds: selectedStudents,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Project sent to ${result.sentTo.length} students!\n\n${result.sentTo.join('\n')}${result.errors ? '\n\nErrors:\n' + result.errors.join('\n') : ''}`);
        setSelectedStudents([]);
        setSelectedProject('');
        setShowSendForm(false);
        fetchResponses(); // Reload responses
      } else {
        alert('❌ Failed to send project: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending project:', error);
      alert('❌ Error sending project. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === activeStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(activeStudents.map(s => s.id));
    }
  };

  const activeStudents = students.filter(student => student.status === 'active');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Projects</h2>
        <p className="text-gray-600">Manage and send projects to students</p>
      </div>

      <div className="mb-6 flex gap-3">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
        <Button variant="secondary" onClick={() => setShowSendForm(true)}>
          <Send className="w-4 h-4 mr-2" />
          Send Project to Student
        </Button>
      </div>

      {/* Create/Edit Project Form */}
      {showForm && (
        <Card className="mb-6">
          <h3 className="text-gray-900 mb-4">
            {editingId ? 'Edit Project' : 'Create New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Enter project requirements (e.g., skills needed, equipment, preparation, etc.)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Students will see these requirements when they receive the project</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistants Required
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.assistantsRequired}
                  onChange={(e) => setFormData({ ...formData, assistantsRequired: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? 'Update Project' : 'Create Project'}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ title: '', date: '', location: '', assistantsRequired: 1, requirements: '', status: 'active' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Send Project Form */}
      {showSendForm && (
        <Card className="mb-6">
          <h3 className="text-gray-900 mb-4">Send Project to Students</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a project...</option>
                {projects.filter(p => p.status === 'active').map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title} - {project.date} - {project.location} ({project.assistantsRequired} needed)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Students ({selectedStudents.length} selected)
                </label>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  onClick={selectAllStudents}
                >
                  {selectedStudents.length === activeStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                {activeStudents.map(student => (
                  <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{student.name}</span>
                    <span className="text-xs text-gray-500">({student.phone || student.email})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSendProject} disabled={sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : `Send to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  setShowSendForm(false);
                  setSelectedProject('');
                  setSelectedStudents([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map(project => (
          <Card key={project.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-gray-900 font-medium">{project.title}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="mr-4">📅 {project.date}</span>
                  <span className="mr-4">📍 {project.location}</span>
                  <span className="mr-4">👥 {project.assistantsRequired} assistants</span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                {project.requirements && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">📋 Project Requirements:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.requirements}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(project)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Responses Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl shadow-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Student Responses</h3>
              <p className="text-purple-100 text-sm">Track project acceptance and feedback</p>
            </div>
          </div>
        </div>

        {responses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No responses yet</p>
              <p className="text-gray-400 text-sm mt-2">Student responses will appear here when they accept or decline projects</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {responses.slice(0, 10).map(response => {
              const isAccepted = response.details.toLowerCase().includes('accept');
              const isDeclined = response.details.toLowerCase().includes('decline');
              
              // Parse student name and project from details
              const parts = response.details.split(' ');
              const studentName = parts.slice(0, parts.indexOf('accepted') !== -1 ? parts.indexOf('accepted') : parts.indexOf('declined')).join(' ');
              const projectName = response.details.split('project: ')[1] || 'Unknown Project';
              
              return (
                <Card key={response.id} className={`border-l-4 ${isAccepted ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${isAccepted ? 'bg-green-200' : 'bg-red-200'}`}>
                        {isAccepted ? (
                          <CheckCircle className="w-6 h-6 text-green-700" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-gray-900">{studentName}</h4>
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                            isAccepted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {isAccepted ? '✅ Accepted' : '❌ Declined'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          📊 {projectName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(response.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
