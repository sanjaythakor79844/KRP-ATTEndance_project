// Attendance service
class AttendanceService {
    constructor() {
        this.attendance = [];
        this.reminders = [];
    }

    markAttendance(studentId, status, notes = '') {
        const record = {
            id: Date.now(),
            studentId,
            status, // 'present', 'absent', 'late'
            notes,
            timestamp: new Date().toISOString()
        };
        
        this.attendance.push(record);
        return record;
    }

    getAttendance(date = null) {
        if (date) {
            return this.attendance.filter(record => {
                const recordDate = new Date(record.timestamp).toDateString();
                return recordDate === date;
            });
        }
        return this.attendance;
    }

    getAttendanceByStudent(studentId) {
        return this.attendance.filter(record => record.studentId === studentId);
    }

    scheduleReminder(studentId, message, scheduledTime) {
        const reminder = {
            id: Date.now(),
            studentId,
            message,
            scheduledTime,
            sent: false,
            createdAt: new Date().toISOString()
        };
        
        this.reminders.push(reminder);
        return reminder;
    }

    getPendingReminders() {
        const now = new Date();
        return this.reminders.filter(reminder => 
            !reminder.sent && new Date(reminder.scheduledTime) <= now
        );
    }

    markReminderSent(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.sent = true;
            reminder.sentAt = new Date().toISOString();
        }
    }

    getAttendanceStats(studentId, startDate, endDate) {
        const records = this.getAttendanceByStudent(studentId).filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
        });

        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const late = records.filter(r => r.status === 'late').length;

        return {
            total,
            present,
            absent,
            late,
            percentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
    }
}

const attendanceService = new AttendanceService();

export default attendanceService;
