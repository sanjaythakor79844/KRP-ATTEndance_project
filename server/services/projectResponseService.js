// Project response tracking and management service
import gmailService from './gmailService.js';
import mongoService from './mongoService.js';

class ProjectResponseService {
    constructor() {
        this.responseKeywords = {
            accept: ['yes', 'accept', 'confirm', 'ok', 'sure', 'available', 'can attend', 'will come'],
            decline: ['no', 'decline', 'reject', 'not available', 'cant', "can't", 'busy', 'unavailable'],
            skip: ['skip', 'maybe', 'not sure', 'depends', 'might', 'possibly', 'tentative']
        };
    }

    // Process incoming email for project responses
    async processProjectResponse(studentEmail, messageText, projectId) {
        try {
            // Find student by email
            const students = await mongoService.getStudents();
            const student = students.find(s => s.email === studentEmail);
            
            if (!student) {
                console.log(`⚠️ Student not found for email: ${studentEmail}`);
                return { success: false, error: 'Student not found' };
            }

            // Detect response type
            const lowerText = messageText.toLowerCase();
            let response = 'unknown';
            
            if (this.responseKeywords.accept.some(keyword => lowerText.includes(keyword))) {
                response = 'accept';
            } else if (this.responseKeywords.decline.some(keyword => lowerText.includes(keyword))) {
                response = 'decline';
            } else if (this.responseKeywords.skip.some(keyword => lowerText.includes(keyword))) {
                response = 'skip';
            }

            const responseData = {
                projectId,
                studentId: student.id,
                response,
                timestamp: new Date().toISOString()
            };

            // Save to MongoDB
            const result = await mongoService.addProjectResponse(responseData);
            
            // Update student's current assignments if accepted
            if (response === 'accept') {
                await mongoService.updateStudent(student.id, {
                    currentAssignments: (student.currentAssignments || 0) + 1
                });
            }

            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            console.error('❌ Error recording project response:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all responses for a project
     */
    async getProjectResponses(projectId) {
        try {
            const responses = await mongoService.getProjectResponses(projectId);
            return {
                success: true,
                data: responses
            };
        } catch (error) {
            console.error('❌ Error fetching project responses:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get student's response history
     */
    async getStudentResponses(studentId) {
        try {
            const responses = await mongoService.getStudentResponses(studentId);
            return {
                success: true,
                data: responses
            };
        } catch (error) {
            console.error('❌ Error fetching student responses:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if student can accept more projects
     */
    async canAcceptProject(studentId) {
        try {
            const student = await mongoService.getStudentById(studentId);
            if (!student) {
                return { canAccept: false, reason: 'Student not found' };
            }

            const currentAssignments = student.currentAssignments || 0;
            const assignmentLimit = student.assignmentLimit || 3;

            if (currentAssignments >= assignmentLimit) {
                return {
                    canAccept: false,
                    reason: `Assignment limit reached (${currentAssignments}/${assignmentLimit})`
                };
            }

            return {
                canAccept: true,
                remaining: assignmentLimit - currentAssignments
            };
        } catch (error) {
            console.error('❌ Error checking project acceptance:', error);
            return {
                canAccept: false,
                reason: error.message
            };
        }
    }
}

const projectResponseService = new ProjectResponseService();
export default projectResponseService;
