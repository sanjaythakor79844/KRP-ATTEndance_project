// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://krp-attendance-project.onrender.com';

export const API_ENDPOINTS = {
  students: `${API_BASE_URL}/api/students`,
  projects: `${API_BASE_URL}/api/projects`,
  attendance: `${API_BASE_URL}/api/attendance`,
  logs: `${API_BASE_URL}/api/logs`,
  broadcast: `${API_BASE_URL}/api/broadcast`,
  templates: `${API_BASE_URL}/api/templates`,
  gmail: `${API_BASE_URL}/api/gmail`,
};
