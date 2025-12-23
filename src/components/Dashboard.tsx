import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FolderKanban, Users, Calendar, ClipboardCheck } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const stats = [
    { label: 'Open Projects', value: '12', icon: FolderKanban, color: 'blue' },
    { label: 'Active Students', value: '48', icon: Users, color: 'green' },
    { label: 'Assignments This Week', value: '7', icon: Calendar, color: 'purple' },
    { label: 'Attendance Pending Today', value: '3', icon: ClipboardCheck, color: 'orange' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your academy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              if (onNavigate) {
                onNavigate('projects');
              } else {
                alert('Navigate to Projects page to create a new project');
              }
            }}
          >
            Create Project
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              if (onNavigate) {
                onNavigate('attendance');
              } else {
                alert('Navigate to Attendance page to create a new attendance trigger');
              }
            }}
          >
            Create Attendance Trigger
          </Button>
        </div>
      </Card>
    </div>
  );
}
