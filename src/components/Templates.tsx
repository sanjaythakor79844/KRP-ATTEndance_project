import { useState } from 'react';
import { Plus, Edit2, Copy, Trash2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
  lastModified: string;
}

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'New Assignment',
      content: 'Hi {name}, you have a new assignment. Please check your dashboard.',
      lastModified: '2024-12-10',
    },
    {
      id: '2',
      name: 'Reminder',
      content: 'Hi {name}, this is a reminder about your pending assignment.',
      lastModified: '2024-12-08',
    },
    {
      id: '3',
      name: 'Welcome Message',
      content: 'Welcome {name}! You have been added to the automation system.',
      lastModified: '2024-12-05',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTemplates(
        templates.map((t) =>
          t.id === editingId
            ? { ...t, ...formData, lastModified: new Date().toISOString().split('T')[0] }
            : t
        )
      );
      setEditingId(null);
    } else {
      const newTemplate: Template = {
        id: String(templates.length + 1),
        ...formData,
        lastModified: new Date().toISOString().split('T')[0],
      };
      setTemplates([...templates, newTemplate]);
    }
    setFormData({ name: '', content: '' });
    setShowForm(false);
  };

  const handleEdit = (template: Template) => {
    setFormData({ name: template.name, content: template.content });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      id: String(templates.length + 1),
      name: `${template.name} (Copy)`,
      content: template.content,
      lastModified: new Date().toISOString().split('T')[0],
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-sm text-gray-600 mt-2">Create and manage message templates for Telegram broadcasts</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', content: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            {editingId ? 'Edit Template' : 'Create New Template'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                id="templateName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., New Assignment"
                required
              />
            </div>
            <div>
              <label htmlFor="templateContent" className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
              <textarea
                id="templateContent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Use {name} for student name placeholder"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Available variables: {'{name}'}, {'{telegramId}'}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', content: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow">
            <span className="text-6xl mb-4 block">📝</span>
            <p className="text-gray-600 text-lg">No templates found. Create your first template to get started.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-100 hover:border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>🕒</span>
                    Modified: {new Date(template.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-sm text-gray-800 break-words border border-blue-100">
                {template.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
