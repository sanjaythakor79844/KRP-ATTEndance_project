// Engagement monitoring and escalation service
class EngagementService {
    constructor() {
        this.thresholds = {
            attendance: 75, // Below 75% attendance triggers monitoring
            projectAcceptance: 60, // Below 60% acceptance triggers monitoring
            projectCompletion: 50 // Below 50% completion triggers monitoring
        };
        
        this.nudgeLevels = {
            first: 'informational',
            second: 'warning',
            final: 'escalation'
        };
        
        this.gracePeriodHours = 72; // 72 hours after final nudge
    }

    async calculateEngagement(studentId) {
        try {
            // Get student data
            const students = await mongoService.getStudents();
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return null;
            }

            // Get attendance data
            const attendance = await mongoService.getAttendance();
            const studentAttendance = attendance.filter(a => a.studentId === studentId);
            
            // Calculate attendance percentage
            const totalSessions = studentAttendance.length;
            const presentSessions = studentAttendance.filter(a => a.status === 'present').length;
            const attendancePercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

            // Get project data
            const projects = await mongoService.getProjects();
            const projectSubmissions = await projectTrackingService.getSubmissions(null, studentId);
            
            // Calculate project acceptance and completion
            const assignedProjects = projects.filter(p => p.assignedTo && p.assignedTo.includes(studentId));
            const acceptedProjects = projectSubmissions.filter(p => p.status === 'submitted');
            const completedProjects = projectSubmissions.filter(p => p.status === 'completed');
            
            const projectAcceptanceRate = assignedProjects.length > 0 ? 
                Math.round((acceptedProjects.length / assignedProjects.length) * 100) : 0;
            const projectCompletionRate = assignedProjects.length > 0 ? 
                Math.round((completedProjects.length / assignedProjects.length) * 100) : 0;

            return {
                studentId,
                studentName: student.name,
                phone: student.phone,
                guardianPhone: student.guardianPhone || student.parentPhone,
                attendancePercentage,
                projectAcceptanceRate,
                projectCompletionRate,
                totalSessions,
                presentSessions,
                assignedProjects: assignedProjects.length,
                acceptedProjects: acceptedProjects.length,
                completedProjects: completedProjects.length,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error calculating engagement:', error);
            return null;
        }
    }

    async checkEngagementThresholds(engagement) {
        const issues = [];
        
        if (engagement.attendancePercentage < this.thresholds.attendance) {
            issues.push({
                type: 'attendance',
                current: engagement.attendancePercentage,
                threshold: this.thresholds.attendance,
                status: 'low'
            });
        }
        
        if (engagement.projectAcceptanceRate < this.thresholds.projectAcceptance) {
            issues.push({
                type: 'projectAcceptance',
                current: engagement.projectAcceptanceRate,
                threshold: this.thresholds.projectAcceptance,
                status: 'low'
            });
        }
        
        if (engagement.projectCompletionRate < this.thresholds.projectCompletion) {
            issues.push({
                type: 'projectCompletion',
                current: engagement.projectCompletionRate,
                threshold: this.thresholds.projectCompletion,
                status: 'low'
            });
        }
        
        return issues;
    }

    async generateNudgeMessage(engagement, nudgeLevel, issues) {
        const { studentName } = engagement;
        
        const issueTexts = issues.map(issue => {
            switch (issue.type) {
                case 'attendance':
                    return `Attendance: ${issue.current}%`;
                case 'projectAcceptance':
                    return `Project Acceptance: ${issue.current}%`;
                case 'projectCompletion':
                    return `Project Completion: ${issue.current}%`;
                default:
                    return '';
            }
        }).filter(text => text).join('\n- ');

        const templates = {
            informational: `Hi ${studentName},\n\nWe noticed that your current course engagement needs attention:\n\n- ${issueTexts}\n\nPlease take steps to improve these metrics and stay on track. Let us know if you need any support.`,
            
            warning: `Hi ${studentName},\n\nThis is a reminder regarding your low engagement status:\n\n- ${issueTexts}\n\nDespite earlier reminders, there has been limited improvement. Please take immediate action.`,
            
            escalation: `Hi ${studentName},\n\nThis is a final reminder regarding your course engagement:\n\n- ${issueTexts}\n\nIf there is no improvement within ${this.gracePeriodHours} hours, your current status will be shared with your guardian/parent for further support.\n\nPlease act immediately or reach out if you're facing challenges.`
        };
        
        return templates[nudgeLevel] || templates.informational;
    }

    async generateGuardianMessage(engagement, issues) {
        const { studentName, guardianPhone } = engagement;
        
        if (!guardianPhone) {
            return null;
        }

        const issueTexts = issues.map(issue => {
            switch (issue.type) {
                case 'attendance':
                    return `Attendance: ${issue.current}%`;
                case 'projectAcceptance':
                    return `Project Acceptance: ${issue.current}%`;
                case 'projectCompletion':
                    return `Project Completion: ${issue.current}%`;
                default:
                    return '';
            }
        }).filter(text => text).join('\n- ');

        return `Hello,\n\nThis is to inform you that ${studentName} has low engagement in their course.\n\n- ${issueTexts}\n\nDespite multiple reminders, there has been limited improvement. We request your support to help the student get back on track.\n\nThank you.`;
    }

    async sendNudge(studentId, nudgeLevel) {
        try {
            const engagement = await this.calculateEngagement(studentId);
            if (!engagement) {
                return { success: false, error: 'Student not found' };
            }

            const issues = await this.checkEngagementThresholds(engagement);
            if (issues.length === 0) {
                return { success: false, error: 'No engagement issues found' };
            }

            const message = await this.generateNudgeMessage(engagement, nudgeLevel, issues);
            
            // Send WhatsApp message
            const result = await backupMessagingService.sendMessage(engagement.phone, message);
            
            // Log the nudge
            await mongoService.addLog({
                type: 'engagement_nudge',
                studentId,
                nudgeLevel,
                issues,
                message,
                sentAt: new Date().toISOString(),
                method: result.method
            });

            return {
                success: true,
                message: `${nudgeLevel} nudge sent successfully`,
                data: {
                    studentName: engagement.studentName,
                    nudgeLevel,
                    issues,
                    method: result.method
                }
            };
        } catch (error) {
            console.error('Error sending nudge:', error);
            return { success: false, error: error.message };
        }
    }

    async escalateToGuardian(studentId) {
        try {
            const engagement = await this.calculateEngagement(studentId);
            if (!engagement) {
                return { success: false, error: 'Student not found' };
            }

            const issues = await this.checkEngagementThresholds(engagement);
            if (issues.length === 0) {
                return { success: false, error: 'No engagement issues found' };
            }

            const message = await this.generateGuardianMessage(engagement, issues);
            
            if (!message) {
                return { success: false, error: 'Guardian phone number not available' };
            }

            // Send WhatsApp message to guardian
            const result = await backupMessagingService.sendMessage(engagement.guardianPhone, message);
            
            // Log the escalation
            await mongoService.addLog({
                type: 'guardian_escalation',
                studentId,
                guardianPhone: engagement.guardianPhone,
                issues,
                message,
                sentAt: new Date().toISOString(),
                method: result.method
            });

            return {
                success: true,
                message: 'Guardian escalation sent successfully',
                data: {
                    studentName: engagement.studentName,
                    guardianPhone: engagement.guardianPhone,
                    issues,
                    method: result.method
                }
            };
        } catch (error) {
            console.error('Error escalating to guardian:', error);
            return { success: false, error: error.message };
        }
    }

    async getEngagementReport() {
        try {
            const students = await mongoService.getStudents();
            const reports = [];

            for (const student of students) {
                const engagement = await this.calculateEngagement(student.id);
                if (engagement) {
                    const issues = await this.checkEngagementThresholds(engagement);
                    reports.push({
                        ...engagement,
                        issues,
                        needsAttention: issues.length > 0
                    });
                }
            }

            return reports;
        } catch (error) {
            console.error('Error generating engagement report:', error);
            throw error;
        }
    }

    async getLowEngagementStudents() {
        try {
            const reports = await this.getEngagementReport();
            return reports.filter(report => report.needsAttention);
        } catch (error) {
            console.error('Error getting low engagement students:', error);
            return [];
        }
    }

    setThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    setGracePeriod(hours) {
        this.gracePeriodHours = hours;
    }
}

const engagementService = new EngagementService();

export default engagementService;
