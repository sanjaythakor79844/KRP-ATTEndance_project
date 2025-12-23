import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.auth = null;
    this.sheets = null;
    this.initialize();
  }

  async initialize() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.auth = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('✅ Google Sheets API initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets API:', error.message);
    }
  }

  // Students Sheet Operations
  async addStudent(studentData) {
    try {
      const values = [[
        new Date().toISOString(),
        studentData.name,
        studentData.telegramId,
        studentData.assignmentLimit || 3,
        studentData.status || 'active',
        studentData.totalAssignments || 0
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_STUDENTS}!A:F`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Student ${studentData.name} added to Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding student:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getStudents() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_STUDENTS}!A2:F`,
      });

      const rows = response.data.values || [];
      return rows.map((row, index) => ({
        id: index + 1,
        timestamp: row[0],
        name: row[1],
        telegramId: row[2],
        assignmentLimit: parseInt(row[3]) || 3,
        status: row[4] || 'active',
        totalAssignments: parseInt(row[5]) || 0
      }));
    } catch (error) {
      console.error('❌ Error getting students:', error.message);
      return [];
    }
  }

  async updateStudent(rowIndex, studentData) {
    try {
      const values = [[
        studentData.timestamp || new Date().toISOString(),
        studentData.name,
        studentData.telegramId,
        studentData.assignmentLimit,
        studentData.status,
        studentData.totalAssignments
      ]];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_STUDENTS}!A${rowIndex + 2}:F${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Student updated in Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating student:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Projects Sheet Operations
  async addProject(projectData) {
    try {
      const values = [[
        new Date().toISOString(),
        projectData.name,
        projectData.status || 'active',
        projectData.createdDate || new Date().toLocaleDateString(),
        projectData.description || ''
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_PROJECTS}!A:E`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Project ${projectData.name} added to Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding project:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getProjects() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_PROJECTS}!A2:E`,
      });

      const rows = response.data.values || [];
      return rows.map((row, index) => ({
        id: index + 1,
        timestamp: row[0],
        name: row[1],
        status: row[2] || 'active',
        created: row[3],
        description: row[4] || ''
      }));
    } catch (error) {
      console.error('❌ Error getting projects:', error.message);
      return [];
    }
  }

  // Attendance Sheet Operations
  async addAttendance(attendanceData) {
    try {
      const values = [[
        new Date().toISOString(),
        attendanceData.className,
        attendanceData.date,
        attendanceData.time,
        attendanceData.manager,
        attendanceData.status || 'scheduled',
        attendanceData.attendedCount || 0,
        attendanceData.totalStudents || 0
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_ATTENDANCE}!A:H`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Attendance for ${attendanceData.className} added to Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding attendance:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getAttendance() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_ATTENDANCE}!A2:H`,
      });

      const rows = response.data.values || [];
      return rows.map((row, index) => ({
        id: index + 1,
        timestamp: row[0],
        className: row[1],
        date: row[2],
        time: row[3],
        manager: row[4],
        status: row[5] || 'scheduled',
        attendedCount: parseInt(row[6]) || 0,
        totalStudents: parseInt(row[7]) || 0
      }));
    } catch (error) {
      console.error('❌ Error getting attendance:', error.message);
      return [];
    }
  }

  // Logs Sheet Operations
  async addLog(logData) {
    try {
      const values = [[
        new Date().toISOString(),
        logData.action,
        logData.student,
        logData.assignedCount || 0,
        logData.status || 'success',
        logData.details || '',
        logData.telegramMessageId || ''
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_LOGS}!A:G`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Log added to Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding log:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getLogs(limit = 100) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_LOGS}!A2:G`,
      });

      const rows = response.data.values || [];
      return rows.slice(-limit).map((row, index) => ({
        id: index + 1,
        timestamp: row[0],
        action: row[1],
        student: row[2],
        assignedCount: parseInt(row[3]) || 0,
        status: row[4] || 'success',
        details: row[5] || '',
        telegramMessageId: row[6] || ''
      }));
    } catch (error) {
      console.error('❌ Error getting logs:', error.message);
      return [];
    }
  }

  // Broadcasts Sheet Operations
  async addBroadcast(broadcastData) {
    try {
      const values = [[
        new Date().toISOString(),
        broadcastData.message,
        broadcastData.sentTo || 'all',
        broadcastData.status || 'sent',
        broadcastData.successCount || 0,
        broadcastData.failedCount || 0
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_BROADCASTS}!A:F`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Broadcast added to Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding broadcast:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Templates Sheet Operations
  async addTemplate(templateData) {
    try {
      const values = [[
        new Date().toISOString(),
        templateData.name,
        templateData.content,
        templateData.category || 'general',
        templateData.usageCount || 0
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_TEMPLATES}!A:E`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log(`✅ Template ${templateData.name} added to Google Sheets`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding template:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getTemplates() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${process.env.SHEET_TEMPLATES}!A2:E`,
      });

      const rows = response.data.values || [];
      return rows.map((row, index) => ({
        id: index + 1,
        timestamp: row[0],
        name: row[1],
        content: row[2],
        category: row[3] || 'general',
        usageCount: parseInt(row[4]) || 0
      }));
    } catch (error) {
      console.error('❌ Error getting templates:', error.message);
      return [];
    }
  }

  // Initialize Sheet Headers
  async initializeSheets() {
    try {
      const sheets = [
        {
          name: process.env.SHEET_STUDENTS,
          headers: ['Timestamp', 'Name', 'Telegram ID', 'Assignment Limit', 'Status', 'Total Assignments']
        },
        {
          name: process.env.SHEET_PROJECTS,
          headers: ['Timestamp', 'Project Name', 'Status', 'Created Date', 'Description']
        },
        {
          name: process.env.SHEET_ATTENDANCE,
          headers: ['Timestamp', 'Class Name', 'Date', 'Time', 'Manager', 'Status', 'Attended Count', 'Total Students']
        },
        {
          name: process.env.SHEET_LOGS,
          headers: ['Timestamp', 'Action', 'Student', 'Assigned Count', 'Status', 'Details', 'Telegram Message ID']
        },
        {
          name: process.env.SHEET_BROADCASTS,
          headers: ['Timestamp', 'Message', 'Sent To', 'Status', 'Success Count', 'Failed Count']
        },
        {
          name: process.env.SHEET_TEMPLATES,
          headers: ['Timestamp', 'Template Name', 'Content', 'Category', 'Usage Count']
        }
      ];

      for (const sheet of sheets) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheet.name}!A1:Z1`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [sheet.headers] },
        });
      }

      console.log('✅ All sheet headers initialized');
      return { success: true };
    } catch (error) {
      console.error('❌ Error initializing sheets:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleSheetsService();
