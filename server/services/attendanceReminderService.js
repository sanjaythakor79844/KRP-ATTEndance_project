// Automated attendance reminder service
import cron from 'node-cron';
import gmailService from './gmailService.js';
import mongoService from './mongoService.js';

class AttendanceReminderService {
    constructor() {
        this.isRunning = false;
        this.reminderJobs = new Map();
    }

    // Start automated attendance reminders
    start() {
        if (this.isRunning) return;
        
        console.log('📅 Starting attendance reminder service...');
        
        // Daily reminder at 9:00 AM
        const dailyReminder = cron.schedule('0 9 * * 1-6', async () => {
            await this.sendDailyAttendanceReminder();
        }, {
            scheduled: false,
            timezone: "Asia/Kolkata"
        });

        // Weekly summary on Sunday at 6:00 PM
        const weeklyReminder = cron.schedule('0 18 * * 0', async () => {
            await this.sendWeeklyAttendanceSummary();
        }, {
            scheduled: false,
            timezone: "Asia/Kolkata"
        });

        // Follow-up reminder at 11:00 AM for non-responders
        const followUpReminder = cron.schedule('0 11 * * 1-6', async () => {
            await this.sendFollowUpReminder();
        }, {
            scheduled: false,
            timezone: "Asia/Kolkata"
        });

        this.reminderJobs.set('daily', dailyReminder);
        this.reminderJobs.set('weekly', weeklyReminder);
        this.reminderJobs.set('followUp', followUpReminder);

        // Start all jobs
        dailyReminder.start();
        weeklyReminder.start();
        followUpReminder.start();

        this.isRunning = true;
        console.log('✅ Attendance reminder service started');
    }

    // Stop all reminders
    stop() {
        if (!this.isRunning) return;
        
        this.reminderJobs.forEach((job, name) => {
            job.destroy();
            console.log(`🛑 Stopped ${name} reminder`);
        });
        
        this.reminderJobs.clear();
        this.isRunning = false;
        console.log('📅 Attendance reminder service stopped');
    }

    // Send daily attendance reminder
    async sendDailyAttendanceReminder() {
        try {
            if (!gmailService.isConnected()) {
                console.log('⚠️ Gmail not connected - skipping attendance reminder');
                return;
            }

            const students = await mongoService.getStudents();
            const activeStudents = students.filter(s => s.status === 'active' && s.email);
            
            const template = gmailService.createEmailTemplate('attendance', {});
            
            let successCount = 0;
            for (const student of activeStudents) {
                try {
                    await gmailService.sendEmail(
                        student.email,
                        template.subject,
                        template.html
                    );
                    successCount++;
                    
                    // Log the reminder
                    await mongoService.addLog({
                        action: 'Daily Attendance Reminder',
                        details: `Reminder sent to ${student.name} (${student.email})`,
                        studentId: student.id
                    });
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`❌ Failed to send reminder to ${student.name}:`, error);
                }
            }

            console.log(`📅 Daily attendance reminder sent to ${successCount}/${activeStudents.length} students`);
            
            // Log summary
            await mongoService.addLog({
                action: 'Daily Attendance Reminder Batch',
                details: `Sent to ${successCount} students`
            });

        } catch (error) {
            console.error('❌ Error sending daily attendance reminder:', error);
        }
    }

    // Send follow-up reminder to non-responders
    async sendFollowUpReminder() {
        try {
            if (!gmailService.isConnected()) return;

            const students = await mongoService.getStudents();
            const today = new Date().toISOString().split('T')[0];
            
            // Get today's attendance records
            const attendance = await mongoService.getAttendance();
            const todayAttendance = attendance.filter(a => a.date === today);
            const respondedStudentIds = todayAttendance.map(a => a.studentId);
            
            // Find students who haven't responded
            const nonResponders = students.filter(s => 
                s.status === 'active' && s.email && !respondedStudentIds.includes(s.id)
            );

            if (nonResponders.length === 0) {
                console.log('✅ All students have marked attendance - no follow-up needed');
                return;
            }

            const template = gmailService.createEmailTemplate('followUp', {});

            let successCount = 0;
            for (const student of nonResponders) {
                try {
                    await gmailService.sendEmail(
                        student.email,
                        template.subject,
                        template.html
                    );
                    successCount++;
                    
                    await mongoService.addLog({
                        action: 'Follow-up Attendance Reminder',
                        details: `Follow-up sent to ${student.name}`,
                        studentId: student.id
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`❌ Failed to send follow-up to ${student.name}:`, error);
                }
            }

            console.log(`⏰ Follow-up reminders sent to ${successCount} non-responders`);

        } catch (error) {
            console.error('❌ Error sending follow-up reminders:', error);
        }
    }

    // Send weekly attendance summary
    async sendWeeklyAttendanceSummary() {
        try {
            if (!gmailService.isConnected()) return;

            const students = await mongoService.getStudents();
            const activeStudents = students.filter(s => s.status === 'active' && s.email);
            
            // Get last 7 days attendance
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const allAttendance = await mongoService.getAttendance();
            
            for (const student of activeStudents) {
                try {
                    const attendance = allAttendance.filter(a => 
                        a.studentId === student.id &&
                        new Date(a.date) >= weekAgo &&
                        new Date(a.date) <= new Date()
                    );
                    
                    const totalDays = 6; // Monday to Saturday
                    const presentDays = attendance.filter(a => a.status === 'present').length;
                    const lateDays = attendance.filter(a => a.status === 'late').length;
                    const absentDays = attendance.filter(a => a.status === 'absent').length;
                    const percentage = Math.round((presentDays / totalDays) * 100);
                    
                    const template = gmailService.createEmailTemplate('weeklyReport', {
                        studentName: student.name,
                        weekStart: weekAgo.toLocaleDateString('en-IN'),
                        weekEnd: new Date().toLocaleDateString('en-IN'),
                        presentDays,
                        lateDays,
                        absentDays,
                        percentage
                    });

                    await gmailService.sendEmail(
                        student.email,
                        template.subject,
                        template.html
                    );
                    
                    await mongoService.addLog({
                        action: 'Weekly Attendance Summary',
                        details: `Summary sent to ${student.name} - ${percentage}% attendance`,
                        studentId: student.id
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.error(`❌ Failed to send summary to ${student.name}:`, error);
                }
            }

            console.log('📊 Weekly attendance summaries sent to all students');

        } catch (error) {
            console.error('❌ Error sending weekly summaries:', error);
        }
    }

    // Manual trigger for attendance reminder
    async triggerManualReminder(customMessage = null) {
        try {
            const students = await mongoService.getStudents();
            const activeStudents = students.filter(s => s.status === 'active' && s.email);
            
            const template = gmailService.createEmailTemplate('attendance', {});
            const subject = customMessage ? '📢 Manual Attendance Check' : template.subject;
            const html = customMessage || template.html;

            let successCount = 0;
            for (const student of activeStudents) {
                try {
                    await gmailService.sendEmail(student.email, subject, html);
                    successCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`❌ Failed to send manual reminder to ${student.name}:`, error);
                }
            }

            await mongoService.addLog({
                action: 'Manual Attendance Reminder',
                details: `Manual reminder sent to ${successCount} students`
            });

            return { success: true, count: successCount };

        } catch (error) {
            console.error('❌ Error sending manual reminder:', error);
            throw error;
        }
    }

    // Get reminder status
    getStatus() {
        return {
            isRunning: this.isRunning,
            activeJobs: Array.from(this.reminderJobs.keys()),
            nextRuns: {
                daily: this.reminderJobs.get('daily')?.nextDate()?.toISOString(),
                weekly: this.reminderJobs.get('weekly')?.nextDate()?.toISOString(),
                followUp: this.reminderJobs.get('followUp')?.nextDate()?.toISOString()
            }
        };
    }
}

const attendanceReminderService = new AttendanceReminderService();

export default attendanceReminderService;