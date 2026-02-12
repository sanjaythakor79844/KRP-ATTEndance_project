// Simple JSON file storage as alternative to MongoDB
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JsonStorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  readCollection(collection) {
    try {
      const filePath = this.getFilePath(collection);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error(`Error reading ${collection}:`, error);
      return [];
    }
  }

  writeCollection(collection, data) {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${collection}:`, error);
      return false;
    }
  }

  // Students
  getStudents() {
    return this.readCollection('students');
  }

  saveStudents(students) {
    return this.writeCollection('students', students);
  }

  addStudent(student) {
    const students = this.getStudents();
    student.id = Date.now().toString();
    student.createdAt = new Date().toISOString();
    students.push(student);
    this.saveStudents(students);
    return student;
  }

  updateStudent(id, updates) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveStudents(students);
      return students[index];
    }
    return null;
  }

  deleteStudent(id) {
    const students = this.getStudents();
    const filtered = students.filter(s => s.id !== id);
    this.saveStudents(filtered);
    return filtered.length < students.length;
  }

  // Projects
  getProjects() {
    return this.readCollection('projects');
  }

  saveProjects(projects) {
    return this.writeCollection('projects', projects);
  }

  addProject(project) {
    const projects = this.getProjects();
    project.id = Date.now().toString();
    project.createdAt = new Date().toISOString();
    projects.push(project);
    this.saveProjects(projects);
    return project;
  }

  updateProject(id, updates) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveProjects(projects);
      return projects[index];
    }
    return null;
  }

  deleteProject(id) {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.saveProjects(filtered);
    return filtered.length < projects.length;
  }

  // Attendance
  getAttendance() {
    return this.readCollection('attendance');
  }

  saveAttendance(attendance) {
    return this.writeCollection('attendance', attendance);
  }

  addAttendance(record) {
    const attendance = this.getAttendance();
    record.id = Date.now().toString();
    record.timestamp = new Date().toISOString();
    attendance.push(record);
    this.saveAttendance(attendance);
    return record;
  }

  // Templates
  getTemplates() {
    return this.readCollection('templates');
  }

  saveTemplates(templates) {
    return this.writeCollection('templates', templates);
  }

  addTemplate(template) {
    const templates = this.getTemplates();
    template.id = Date.now().toString();
    template.createdAt = new Date().toISOString();
    templates.push(template);
    this.saveTemplates(templates);
    return template;
  }

  // Logs
  getLogs() {
    return this.readCollection('logs');
  }

  saveLogs(logs) {
    return this.writeCollection('logs', logs);
  }

  addLog(log) {
    const logs = this.getLogs();
    log.id = Date.now().toString();
    log.timestamp = new Date().toISOString();
    logs.unshift(log); // Add to beginning
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.length = 100;
    }
    this.saveLogs(logs);
    return log;
  }

  // Clear all data
  clearAll() {
    this.saveStudents([]);
    this.saveProjects([]);
    this.saveAttendance([]);
    this.saveTemplates([]);
    this.saveLogs([]);
    console.log('🗑️ All data cleared');
  }

  // Initialize with empty data
  initialize() {
    console.log('💾 Using JSON file storage');
    console.log('📁 Data directory:', this.dataDir);
    
    // Create empty files if they don't exist
    const collections = ['students', 'projects', 'attendance', 'templates', 'logs'];
    collections.forEach(collection => {
      const filePath = this.getFilePath(collection);
      if (!fs.existsSync(filePath)) {
        this.writeCollection(collection, []);
      }
    });
    
    console.log('✅ JSON storage initialized');
  }
}

const jsonStorage = new JsonStorageService();
export default jsonStorage;
