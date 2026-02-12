import gmailService from './gmailService.js';
import emailTemplates from '../templates/emailTemplates.js';

class AttendanceTrackingService {
  constructor() {
    this.attendanceRecords = [];
  }

  // Mark attendance for a student
  async markAttendance(studentId, studentName, studentEmail, date, status, className) {
    const record = {
      id: Date.now().toString(),
      studentId,
      studentName,
      date,
      status, // 'present', 'absent', 'late'
      className,
      timestamp: new Date().toISOString()
    };
    
    this.attendanceRecords.push(record);
    console.log(`✅ Attendance marked: ${studentName} - ${status}`);
    
    // Send notification email to student
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
      data: record
    };
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
  calculateAttendance(studentId, startDate = null, endDate = null) {
    let records = this.attendanceRecords.filter(r => r.studentId === studentId);
    
    // Filter by date range if provided
    if (startDate) {
      records = records.filter(r => new Date(r.date) >= new Date(startDate));
    }
    if (endDate) {
      records = records.filter(r => new Date(r.date) <= new Date(endDate));
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
  }

  // Get attendance status based on percentage
  getAttendanceStatus(percentage) {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  }

  // Get all students attendance summary
  getAllStudentsAttendance(students) {
    return students.map(student => {
      const summary = this.calculateAttendance(student.id);
      return {
        ...student,
        attendance: summary
      };
    });
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

      const summary = this.calculateAttendance(student.id);
      
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
  getRecords(startDate = null, endDate = null) {
    let records = [...this.attendanceRecords];
    
    if (startDate) {
      records = records.filter(r => new Date(r.date) >= new Date(startDate));
    }
    if (endDate) {
      records = records.filter(r => new Date(r.date) <= new Date(endDate));
    }

    return records;
  }

  // Get today's attendance summary
  getTodaysSummary(students) {
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = this.attendanceRecords.filter(r => r.date === today);
    
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
  }
}

const attendanceTrackingService = new AttendanceTrackingService();
export default attendanceTrackingService;
