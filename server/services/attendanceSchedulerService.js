// Automatic attendance reminder scheduler
import cron from 'node-cron';
import attendanceTrackingService from './attendanceTrackingService.js';
import mongoService from './mongoService.js';
import gmailService from './gmailService.js';

class AttendanceSchedulerService {
  constructor() {
    this.jobs = [];
    this.isEnabled = true;
  }

  // Start automatic daily reminders
  startDailyReminders() {
    if (!this.isEnabled) {
      console.log('⚠️ Attendance scheduler is disabled');
      return;
    }

    // Schedule: Every day at 9:00 AM
    const dailyJob = cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Running daily attendance check...');
      await this.checkAndNotifyLowAttendance();
    });

    this.jobs.push(dailyJob);
    console.log('✅ Daily attendance reminder scheduled (9:00 AM)');

    // For testing: Also run every 5 minutes (comment out in production)
    // const testJob = cron.schedule('*/5 * * * *', async () => {
    //   console.log('🔔 [TEST] Running attendance check...');
    //   await this.checkAndNotifyLowAttendance();
    // });
    // this.jobs.push(testJob);
    // console.log('✅ Test reminder scheduled (every 5 minutes)');
  }

  // Check attendance and send reminders to students with low attendance
  async checkAndNotifyLowAttendance() {
    try {
      if (!gmailService.isConnected()) {
        console.log('⚠️ Gmail not connected - skipping attendance check');
        return;
      }

      const students = await mongoService.getStudents();
      const activeStudents = students.filter(s => s.status === 'active' && s.email);

      let notificationsSent = 0;
      let skipped = 0;

      for (const student of activeStudents) {
        const summary = await attendanceTrackingService.calculateAttendance(student.id);

        // Send notification if student has attendance records
        if (summary.totalDays > 0) {
          const result = await attendanceTrackingService.sendAttendanceNotification(student, summary);

          if (result.success) {
            notificationsSent++;
            const emailType = summary.percentage < 80 ? 'Warning' : 'Congratulations';
            console.log(`✅ ${emailType} email sent to ${student.name} (${summary.percentage}%)`);

            // Log the action
            await mongoService.addLog({
              action: 'Automatic Attendance Notification',
              details: `${emailType} email sent to ${student.name} (${summary.percentage}%)`,
            });
          }
        } else {
          skipped++;
        }
      }

      console.log(`📧 Automatic reminders: ${notificationsSent} sent, ${skipped} skipped`);

      return {
        success: true,
        sent: notificationsSent,
        skipped: skipped
      };
    } catch (error) {
      console.error('❌ Error in automatic attendance check:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manual trigger for testing
  async triggerNow() {
    console.log('🔔 Manually triggering attendance check...');
    return await this.checkAndNotifyLowAttendance();
  }

  // Stop all scheduled jobs
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('🛑 All attendance reminders stopped');
  }

  // Enable/disable scheduler
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`📅 Attendance scheduler ${enabled ? 'enabled' : 'disabled'}`);
  }
}

const attendanceScheduler = new AttendanceSchedulerService();
export default attendanceScheduler;
