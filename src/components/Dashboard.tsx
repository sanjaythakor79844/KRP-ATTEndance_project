import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GmailStatus } from './GmailStatus';
import { FolderKanban, Users, Calendar, ClipboardCheck, Clock, CheckCircle, XCircle, AlertCircle, Phone, Send, BarChart3, TrendingUp } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'attendance' | 'broadcast';
  description: string;
  student: string;
  studentNumber?: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  assignmentLimit: number;
  currentAssignments: number;
  status: 'active' | 'inactive';
}

interface Project {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'active' | 'completed';
}

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const studentsResponse = await fetch('http://localhost:5000/api/students');
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          setStudents(studentsData.data);
        }

        // Fetch projects
        const projectsResponse = await fetch('http://localhost:5000/api/projects');
        const projectsData = await projectsResponse.json();
        if (projectsData.success) {
          setProjects(projectsData.data);
        }

        // Fetch logs for recent activities
        const logsResponse = await fetch('http://localhost:5000/api/logs');
        const logsData = await logsResponse.json();
        if (logsData.success) {
          const activities = logsData.data.slice(0, 5).map((log: any) => ({
            id: log.id,
            type: log.action.includes('Student') ? 'broadcast' : 
                  log.action.includes('Project') ? 'project' : 'attendance',
            description: log.details,
            student: log.details.includes('Student') ? log.details.split(' ')[1] : 'System',
            status: log.action.includes('Added') || log.action.includes('Created') ? 'success' : 
                   log.action.includes('Deleted') ? 'failed' : 'pending',
            timestamp: new Date(log.timestamp).toLocaleString()
          }));
          setRecentActivities(activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { 
      label: 'Total Projects', 
      value: projects.length.toString(), 
      icon: FolderKanban, 
      color: 'blue',
      change: '+2 this week',
      changeType: 'positive'
    },
    { 
      label: 'Active Students', 
      value: students.filter(s => s.status === 'active').length.toString(), 
      icon: Users, 
      color: 'green',
      change: '+3 new students',
      changeType: 'positive'
    },
    { 
      label: 'Pending Tasks', 
      value: students.filter(s => s.currentAssignments < s.assignmentLimit).length.toString(), 
      icon: Calendar, 
      color: 'purple',
      change: '-5 completed',
      changeType: 'positive'
    },
    { 
      label: 'Messages Sent', 
      value: recentActivities.filter(a => a.status === 'success').length.toString(), 
      icon: Send, 
      color: 'orange',
      change: '+12 today',
      changeType: 'positive'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-500" />;
      case 'attendance':
        return <ClipboardCheck className="w-4 h-4 text-green-500" />;
      case 'broadcast':
        return <Send className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here's your academy overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-7 h-7 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Activity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          <span className="text-sm text-gray-600 font-medium capitalize">{activity.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 font-medium">{activity.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">{activity.student}</p>
                            {activity.studentNumber && (
                              <p className="text-xs text-gray-500">{activity.studentNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(activity.status)}
                          <span className="text-sm font-medium capitalize">{activity.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-sm">{activity.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Gmail Status */}
        <div className="lg:col-span-1">
          <GmailStatus />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
          <Send className="w-5 h-5 text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => {
              if (onNavigate) {
                onNavigate('projects');
              } else {
                alert('Navigate to Projects page to create a new project');
              }
            }}
          >
            <FolderKanban className="w-4 h-4 mr-2" />
            Create Project
          </Button>
          <Button 
            variant="secondary"
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow hover:shadow-md transition-all duration-200"
            onClick={() => {
              if (onNavigate) {
                onNavigate('attendance');
              } else {
                alert('Navigate to Attendance page to create a new attendance trigger');
              }
            }}
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
          <Button 
            variant="secondary"
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow hover:shadow-md transition-all duration-200"
            onClick={() => {
              if (onNavigate) {
                onNavigate('broadcast');
              } else {
                alert('Navigate to Broadcast page to send messages');
              }
            }}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Broadcast
          </Button>
        </div>
      </Card>
    </div>
  );
}
