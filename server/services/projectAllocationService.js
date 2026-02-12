// Project allocation service with weekly limits and automation
class ProjectAllocationService {
    constructor() {
        this.weeklyLimit = 3; // Default weekly project limit per student
        this.broadcastQueue = [];
        this.allocationHistory = new Map(); // Track allocations per student per week
    }

    async createProject(projectData) {
        try {
            const project = {
                ...projectData,
                id: Date.now().toString(),
                status: 'active',
                createdAt: new Date().toISOString(),
                allocatedTo: [],
                pendingAllocation: true,
                weeklyLimit: projectData.weeklyLimit || this.weeklyLimit
            };
            
            const result = await mongoService.addProject(project);
            
            if (result.success) {
                // Add to broadcast queue
                this.broadcastQueue.push({
                    projectId: project.id,
                    project: result.data,
                    targetBatches: projectData.targetBatches || [],
                    targetStudents: projectData.targetStudents || [],
                    priority: projectData.priority || 'normal'
                });
                
                console.log(`📋 Project "${project.title}" added to broadcast queue`);
            }
            
            return result;
        } catch (error) {
            console.error('Error creating project:', error);
            return { success: false, error: error.message };
        }
    }

    async broadcastProject(projectId, options = {}) {
        try {
            const projects = await mongoService.getProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (!project) {
                return { success: false, error: 'Project not found' };
            }

            // Get target students
            let targetStudents = [];
            
            if (options.studentIds && Array.isArray(options.studentIds)) {
                // Specific students
                const allStudents = await mongoService.getStudents();
                targetStudents = allStudents.filter(s => options.studentIds.includes(s.id));
            } else if (options.targetBatches && Array.isArray(options.targetBatches)) {
                // Specific batches
                const allStudents = await mongoService.getStudents();
                targetStudents = allStudents.filter(s => 
                    options.targetBatches.includes(s.batch) || 
                    options.targetBatches.includes(s.course)
                );
            } else {
                // All students
                targetStudents = await mongoService.getStudents();
            }

            // Priority: students with zero accepted projects first
            const studentStats = await this.getStudentAllocationStats();
            const sortedStudents = targetStudents.sort((a, b) => {
                const aAccepted = studentStats.get(a.id)?.acceptedProjects || 0;
                const bAccepted = studentStats.get(b.id)?.acceptedProjects || 0;
                return aAccepted - bAccepted; // Zero accepted students first
            });

            const results = [];
            const currentWeek = this.getCurrentWeekKey();

            for (const student of sortedStudents) {
                try {
                    // Check weekly limit
                    const studentWeeklyCount = this.allocationHistory.get(student.id)?.[currentWeek] || 0;
                    
                    if (studentWeeklyCount >= project.weeklyLimit) {
                        // Send auto-decline message
                        await this.sendAutoDeclineMessage(student, project);
                        results.push({
                            student: student.name || student.phone,
                            status: 'auto_declined',
                            reason: 'Weekly limit exceeded',
                            weeklyCount: studentWeeklyCount
                        });
                        continue;
                    }

                    // Send project offer
                    const message = this.generateProjectMessage(student, project);
                    const sendResult = await backupMessagingService.sendMessage(student.phone, message);
                    
                    // Track allocation
                    if (!this.allocationHistory.has(student.id)) {
                        this.allocationHistory.set(student.id, {});
                    }
                    this.allocationHistory.get(student.id)[currentWeek] = studentWeeklyCount + 1;
                    
                    results.push({
                        student: student.name || student.phone,
                        status: 'offered',
                        method: sendResult.method,
                        weeklyCount: studentWeeklyCount + 1
                    });
                    
                    // Log allocation
                    await mongoService.addLog({
                        type: 'project_offer',
                        projectId,
                        studentId: student.id,
                        studentName: student.name,
                        projectName: project.title,
                        weeklyCount: studentWeeklyCount + 1,
                        sentAt: new Date().toISOString(),
                        method: sendResult.method
                    });
                    
                } catch (error) {
                    results.push({
                        student: student.name || student.phone,
                        status: 'failed',
                        error: error.message
                    });
                }
            }

            const successCount = results.filter(r => r.status !== 'failed').length;

            return {
                success: successCount > 0,
                message: `Project broadcast sent to ${successCount}/${sortedStudents.length} students`,
                results
            };
        } catch (error) {
            console.error('Error broadcasting project:', error);
            return { success: false, error: error.message };
        }
    }

    async handleStudentResponse(studentId, projectId, response) {
        try {
            const projects = await mongoService.getProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (!project) {
                return { success: false, error: 'Project not found' };
            }

            const students = await mongoService.getStudents();
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                return { success: false, error: 'Student not found' };
            }

            if (response.toLowerCase() === 'accept') {
                // Check if still within weekly limit
                const currentWeek = this.getCurrentWeekKey();
                const studentWeeklyCount = this.allocationHistory.get(studentId)?.[currentWeek] || 0;
                
                if (studentWeeklyCount > project.weeklyLimit) {
                    await this.sendAutoDeclineMessage(student, project);
                    return { success: false, error: 'Weekly limit exceeded' };
                }

                // Accept project
                await projectTrackingService.submitProject(studentId, projectId, {
                    status: 'accepted',
                    acceptedAt: new Date().toISOString()
                });

                // Update project allocation
                await mongoService.updateProject(projectId, {
                    $push: { allocatedTo: studentId },
                    pendingAllocation: false
                });

                // Send confirmation
                const confirmationMessage = `✅ Project Accepted!\n\nProject: ${project.title}\nDate: ${project.date}\nLocation: ${project.location}\n\nPlease mark your attendance and complete the project on time.`;
                await backupMessagingService.sendMessage(student.phone, confirmationMessage);

                // Log acceptance
                await mongoService.addLog({
                    type: 'project_acceptance',
                    projectId,
                    studentId,
                    studentName: student.name,
                    projectName: project.title,
                    acceptedAt: new Date().toISOString()
                });

                return { success: true, message: 'Project accepted successfully' };
                
            } else if (response.toLowerCase() === 'decline') {
                // Decline project
                await projectTrackingService.submitProject(studentId, projectId, {
                    status: 'declined',
                    declinedAt: new Date().toISOString()
                });

                // Log decline
                await mongoService.addLog({
                    type: 'project_decline',
                    projectId,
                    studentId,
                    studentName: student.name,
                    projectName: project.title,
                    declinedAt: new Date().toISOString()
                });

                return { success: true, message: 'Project declined' };
            }

            return { success: false, error: 'Invalid response' };
        } catch (error) {
            console.error('Error handling student response:', error);
            return { success: false, error: error.message };
        }
    }

    async sendRemindersForUnresponsiveStudents(projectId, hoursSinceBroadcast = 24) {
        try {
            const projects = await mongoService.getProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (!project) {
                return { success: false, error: 'Project not found' };
            }

            // Get students who haven't responded
            const allStudents = await mongoService.getStudents();
            const submissions = await projectTrackingService.getSubmissions(projectId);
            const responsiveStudentIds = submissions.map(s => s.studentId);
            const unresponsiveStudents = allStudents.filter(s => !responsiveStudentIds.includes(s.id));

            const results = [];
            
            for (const student of unresponsiveStudents) {
                try {
                    const reminderMessage = `⏰ Reminder: Project Pending\n\nProject: ${project.title}\nDate: ${project.date}\nLocation: ${project.location}\n\nPlease respond with "Accept" or "Decline" to this message.\n\nThis is an automated reminder.`;
                    
                    const sendResult = await backupMessagingService.sendMessage(student.phone, reminderMessage);
                    
                    results.push({
                        student: student.name || student.phone,
                        status: 'reminder_sent',
                        method: sendResult.method
                    });
                    
                } catch (error) {
                    results.push({
                        student: student.name || student.phone,
                        status: 'failed',
                        error: error.message
                    });
                }
            }

            const successCount = results.filter(r => r.status !== 'failed').length;

            return {
                success: successCount > 0,
                message: `Reminders sent to ${successCount}/${unresponsiveStudents.length} unresponsive students`,
                results
            };
        } catch (error) {
            console.error('Error sending reminders:', error);
            return { success: false, error: error.message };
        }
    }

    generateProjectMessage(student, project) {
        return `📋 New Project Opportunity\n\n` +
               `Student: ${student.name}\n` +
               `Project: ${project.title}\n` +
               `Date: ${project.date}\n` +
               `Location: ${project.location}\n` +
               `Requirements: ${project.requirements || 'TBA'}\n` +
               `Assistants Required: ${project.assistantsRequired || 'TBA'}\n\n` +
               `Weekly Limit: ${project.weeklyLimit} projects\n\n` +
               `Please reply with:\n` +
               `"Accept" to take this project\n` +
               `"Decline" to pass this opportunity\n\n` +
               `This offer expires in 24 hours.`;
    }

    async sendAutoDeclineMessage(student, project) {
        const message = `❌ Project Auto-Declined\n\n` +
                       `Project: ${project.title}\n` +
                       `Reason: Weekly project limit (${project.weeklyLimit}) exceeded\n\n` +
                       `You have already accepted your maximum number of projects this week.\n` +
                       `Please try again next week or contact admin if you need assistance.`;
        
        await backupMessagingService.sendMessage(student.phone, message);
    }

    getCurrentWeekKey() {
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil((now - new Date(year, 0, 1)) / 604800000); // Week number
        return `${year}-W${week}`;
    }

    async getStudentAllocationStats() {
        const stats = new Map();
        const submissions = await projectTrackingService.getSubmissions();
        
        for (const submission of submissions) {
            if (!stats.has(submission.studentId)) {
                stats.set(submission.studentId, {
                    acceptedProjects: 0,
                    declinedProjects: 0,
                    completedProjects: 0
                });
            }
            
            const studentStats = stats.get(submission.studentId);
            if (submission.status === 'accepted') {
                studentStats.acceptedProjects++;
            } else if (submission.status === 'declined') {
                studentStats.declinedProjects++;
            } else if (submission.status === 'completed') {
                studentStats.completedProjects++;
            }
        }
        
        return stats;
    }

    async getAllocationReport(projectId) {
        try {
            const projects = await mongoService.getProjects();
            const project = projects.find(p => p.id === projectId);
            
            if (!project) {
                return null;
            }

            const submissions = await projectTrackingService.getSubmissions(projectId);
            const students = await mongoService.getStudents();
            
            const report = {
                project: {
                    id: project.id,
                    title: project.title,
                    date: project.date,
                    location: project.location,
                    assistantsRequired: project.assistantsRequired
                },
                totalBroadcast: students.length,
                responses: submissions.length,
                accepted: submissions.filter(s => s.status === 'accepted').length,
                declined: submissions.filter(s => s.status === 'declined').length,
                pending: students.length - submissions.length,
                responseRate: students.length > 0 ? Math.round((submissions.length / students.length) * 100) : 0,
                acceptanceRate: submissions.length > 0 ? Math.round((submissions.filter(s => s.status === 'accepted').length / submissions.length) * 100) : 0,
                details: submissions.map(s => {
                    const student = students.find(st => st.id === s.studentId);
                    return {
                        studentId: s.studentId,
                        studentName: student?.name || 'Unknown',
                        phone: student?.phone || 'Unknown',
                        status: s.status,
                        respondedAt: s.submittedAt
                    };
                })
            };
            
            return report;
        } catch (error) {
            console.error('Error getting allocation report:', error);
            return null;
        }
    }

    setWeeklyLimit(limit) {
        this.weeklyLimit = Math.max(1, limit); // Minimum 1 project per week
    }

    getWeeklyLimit() {
        return this.weeklyLimit;
    }
}

const projectAllocationService = new ProjectAllocationService();

export default projectAllocationService;
