import gmailService from './gmailService.js';
import emailTemplates from '../templates/emailTemplates.js';
import mongoService from './mongoService.js';

class AttendanceTrackingService {
  constructor() {
    // No in-memory storage - use MongoDB directly
  }

  // Mark attendance for a student
  async markAttendance(studentId, studentName, studentEmail, date, status, className) {
    try {
      // Check if attendance already exists for this student on this date
      const existingRecords = await mongoService.getAttendance();
      const existingRecord = existingRecords.find(r => 
        r.studentId === studentId && 
        new Date(r.timestamp).toISOString().split('T')[0] === date
      );

      if (existingRecord) {
        // Update existing record
        console.log(`🔄 Updating attendance for ${studentName} on ${date}`);
        // Delete old record and create new one (simpler than update)
        await mongoService.deleteAttendanceRecord(existingRecord.id);
      }

      const record = {
        studentId,
        studentName,
        studentEmail,
        date,
        status, // 'present', 'absent', 'late'
        className,
        timestamp: new Date().toISOString()
      };
      
      // Save to MongoDB
      const result = await mongoService.addAttendance(record);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save attendance');
      }

      console.log(`✅ Attendance marked: ${studentName} - ${status}`);
      
      // Send notification email to student (optional, don't fail if it doesn't work)
      if (studentEmail && gmailService.isConnected()) {
        try {
          await this.sendAttendanceConfirmation(studentName, studentEmail, date, status);
        } catch (error) {
          console.error(`⚠️ Failed to send attendance confirmation to ${studentName}:`, error);
          // Don't fail the attendance marking if email fails
        }
      }
      
      return {
        success: true,
        message: `Attendance marked as ${status}`,
        data: result.data
      };
    } catch (error) {
      console.error(`❌ Error marking attendance:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send attendance confirmation email to student
  async sendAttendanceConfirmation(studentName, studentEmail, date, status) {
    const statusEmoji = {
      present: '✅',
      absent: '❌',
      late: '⏰'
    };

    const statusColor = {
      present: '#10b981',
      absent: '#ef4444',
      late: '#f59e0b'
    };

    const statusText = {
      present: 'Present',
      absent: 'Absent',
      late: 'Late'
    };

    const html = emailTemplates.attendanceConfirmation({
      studentName,
      date: new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      status: statusText[status],
      statusEmoji: statusEmoji[status],
      statusColor: statusColor[status]
    });

    const subject = `${statusEmoji[status]} Attendance Marked - ${statusText[status]}`;

    await gmailService.sendEmail(studentEmail, subject, html);
    console.log(`✅ Attendance confirmation sent to ${studentName}`);
  }

  // Calculate attendance percentage for a student
  async calculateAttendance(studentId, startDate = null, endDate = null) {
    try {
      // Get all attendance records from MongoDB
      const allRecords = await mongoService.getAttendance();
      let records = allRecords.filter(r => r.studentId === studentId);
      
      // Filter by date range if provided
      if (startDate) {
        records = records.filter(r => new Date(r.date || r.timestamp) >= new Date(startDate));
      }
      if (endDate) {
        records = records.filter(r => new Date(r.date || r.timestamp) <= new Date(endDate));
      }

      const totalDays = records.length;
      const presentDays = records.filter(r => r.status === 'present').length;
      const absentDays = records.filter(r => r.status === 'absent').length;
      const lateDays = records.filter(r => r.status === 'late').length;
      
      // Calculate percentage: (present + late) / total * 100
      const percentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;
      
      return {
        studentId,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        percentage,
        status: this.getAttendanceStatus(percentage)
      };
    } catch (error) {
      console.error(`❌ Error calculating attendance for ${studentId}:`, error);
      return {
        studentId,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        percentage: 0,
        status: 'unknown'
      };
    }
  }

  // Get attendance status based on percentage
  getAttendanceStatus(percentage) {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  }

  // Get all students attendance summary
  async getAllStudentsAttendance(students) {
    const summaries = [];
    for (const student of students) {
      const summary = await this.calculateAttendance(student.id);
      summaries.push({
        ...student,
        attendance: summary
      });
    }
    return summaries;
  }

  // Send attendance notification email
  async sendAttendanceNotification(student, attendanceSummary) {
    if (!gmailService.isConnected() || !student.email) {
      console.log(`⚠️ Cannot send email to ${student.name}: Gmail not connected or no email`);
      return { success: false, reason: 'Gmail not connected or no email' };
    }

    const { percentage, totalDays, presentDays, absentDays, lateDays, status } = attendanceSummary;
    
    let subject, html;

    if (percentage < 80) {
      // Use professional warning template
      html = emailTemplates.attendanceWarning({
        studentName: student.name,
        studentId: student.id,
        percentage,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        dashboardUrl: 'http://localhost:5173'
      });
      subject = `⚠️ Low Attendance Alert - ${percentage}%`;
    } else {
      // Use professional congratulations template
      html = emailTemplates.attendanceCongratulations({
        studentName: student.name,
        studentId: student.id,
        percentage,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        dashboardUrl: 'http://localhost:5173'
      });
      subject = `🎉 Excellent Attendance - ${percentage}%`;
    }

    try {
      await gmailService.sendEmail(student.email, subject, html);
      console.log(`✅ Attendance notification sent to ${student.name} (${percentage}%)`);
      return { success: true, percentage, status };
    } catch (error) {
      console.error(`❌ Failed to send attendance notification to ${student.name}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Check all students and send notifications
  async checkAndNotifyAll(students) {
    console.log('🔍 Checking attendance for all students...');
    
    const results = {
      total: students.length,
      notified: 0,
      skipped: 0,
      errors: []
    };

    for (const student of students) {
      if (student.status !== 'active' || !student.email) {
        results.skipped++;
        continue;
      }

      const summary = await this.calculateAttendance(student.id);
      
      // Only send if student has attendance records
      if (summary.totalDays > 0) {
        const result = await this.sendAttendanceNotification(student, summary);
        if (result.success) {
          results.notified++;
        } else {
          results.errors.push({ student: student.name, error: result.reason || result.error });
        }
      } else {
        results.skipped++;
      }
    }

    console.log(`📧 Attendance notifications: ${results.notified} sent, ${results.skipped} skipped`);
    return results;
  }

  // Get attendance records for a date range
  async getRecords(startDate = null, endDate = null) {
    try {
      const allRecords = await mongoService.getAttendance();
      let records = [...allRecords];
      
      if (startDate) {
        records = records.filter(r => new Date(r.date || r.timestamp) >= new Date(startDate));
      }
      if (endDate) {
        records = records.filter(r => new Date(r.date || r.timestamp) <= new Date(endDate));
      }

      return records;
    } catch (error) {
      console.error('❌ Error getting records:', error);
      return [];
    }
  }

  // Get today's attendance summary
  async getTodaysSummary(students) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allRecords = await mongoService.getAttendance();
      const todaysRecords = allRecords.filter(r => {
        const recordDate = new Date(r.date || r.timestamp).toISOString().split('T')[0];
        return recordDate === today;
      });
      
      const total = students.filter(s => s.status === 'active').length;
      const marked = new Set(todaysRecords.map(r => r.studentId)).size;
      const present = todaysRecords.filter(r => r.status === 'present').length;
      const absent = todaysRecords.filter(r => r.status === 'absent').length;
      const late = todaysRecords.filter(r => r.status === 'late').length;
      const notMarked = total - marked;

      return {
        date: today,
        total,
        marked,
        notMarked,
        present,
        absent,
        late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Error getting today\'s summary:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        total: 0,
        marked: 0,
        notMarked: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0
      };
    }
  }
}

const attendanceTrackingService = new AttendanceTrackingService();
export default attendanceTrackingService;
