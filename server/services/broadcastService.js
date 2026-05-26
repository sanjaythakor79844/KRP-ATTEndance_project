// Broadcast service for Gmail
import gmailService from './gmailService.js';
import emailTemplates from '../templates/emailTemplates.js';

class BroadcastService {
    constructor() {
        this.templates = [
            {
                id: 1,
                name: 'Project Update',
                subject: '📢 New Project Update',
                message: '<h2>📢 New Project Update</h2><p><strong>Project:</strong> {projectName}</p><p><strong>Deadline:</strong> {deadline}</p><p>Please check your dashboard for details.</p>'
            },
            {
                id: 2,
                name: 'Attendance Reminder',
                subject: '⏰ Attendance Reminder',
                message: '<h2>⏰ Attendance Reminder</h2><p>Don\'t forget to mark your attendance for today.</p><p><a href="{attendanceLink}">Mark Attendance</a></p>'
            },
            {
                id: 3,
                name: 'General Announcement',
                subject: '📢 Announcement',
                message: '<h2>📢 Announcement</h2><p>{message}</p><p>Thank you!</p>'
            }
        ];
    }

    async sendBroadcast(subject, message, students) {
        const results = [];
        
        // Use professional broadcast template
        const html = emailTemplates.broadcastMessage({
            subject,
            message,
            dashboardUrl: 'http://localhost:5173'
        });
        
        for (const student of students) {
            try {
                if (gmailService && gmailService.isConnected() && student.email) {
                    await gmailService.sendEmail(student.email, subject, html);
                    results.push({
                        student: student.name || student.email,
                        email: student.email,
                        status: 'sent',
                        success: true
                    });
                } else if (!student.email) {
                    results.push({
                        student: student.name || 'Unknown',
                        email: 'N/A',
                        status: 'no email',
                        success: false
                    });
                } else {
                    results.push({
                        student: student.name || student.email,
                        email: student.email,
                        status: 'queued',
                        success: true
                    });
                }
            } catch (error) {
                results.push({
                    student: student.name || student.email,
                    email: student.email,
                    status: 'failed',
                    error: error.message,
                    success: false
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        
        return {
            success: successCount > 0,
            message: `Broadcast sent to ${successCount}/${students.length} students`,
            results
        };
    }

    getTemplates() {
        return this.templates;
    }

    getTemplate(id) {
        return this.templates.find(t => t.id === id);
    }
}

const broadcastService = new BroadcastService();

export default broadcastService;
