// Project tracking service
class ProjectTrackingService {
    constructor() {
        this.projects = [];
        this.submissions = [];
    }

    createProject(projectData) {
        const project = {
            id: Date.now(),
            title: projectData.title,
            description: projectData.description,
            deadline: projectData.deadline,
            assignedTo: projectData.assignedTo || [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.projects.push(project);
        return project;
    }

    getProjects(status = null) {
        if (status) {
            return this.projects.filter(p => p.status === status);
        }
        return this.projects;
    }

    getProject(id) {
        return this.projects.find(p => p.id === id);
    }

    updateProject(id, updates) {
        const project = this.getProject(id);
        if (project) {
            Object.assign(project, updates);
            project.updatedAt = new Date().toISOString();
        }
        return project;
    }

    deleteProject(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            return this.projects.splice(index, 1)[0];
        }
        return null;
    }

    submitProject(studentId, projectId, submissionData) {
        const submission = {
            id: Date.now(),
            studentId,
            projectId,
            submittedAt: new Date().toISOString(),
            status: 'submitted',
            ...submissionData
        };
        
        this.submissions.push(submission);
        return submission;
    }

    getSubmissions(projectId = null, studentId = null) {
        let submissions = this.submissions;
        
        if (projectId) {
            submissions = submissions.filter(s => s.projectId === projectId);
        }
        
        if (studentId) {
            submissions = submissions.filter(s => s.studentId === studentId);
        }
        
        return submissions;
    }

    getStudentProjects(studentId) {
        return this.projects.filter(p => p.assignedTo.includes(studentId));
    }

    getProjectStats(projectId) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const submissions = this.getSubmissions(projectId);
        const totalAssigned = project.assignedTo.length;
        const submitted = submissions.length;
        const pending = totalAssigned - submitted;

        return {
            totalAssigned,
            submitted,
            pending,
            submissionRate: totalAssigned > 0 ? Math.round((submitted / totalAssigned) * 100) : 0
        };
    }

    getOverdueProjects() {
        const now = new Date();
        return this.projects.filter(p => 
            p.status === 'active' && new Date(p.deadline) < now
        );
    }
}

const projectTrackingService = new ProjectTrackingService();

export default projectTrackingService;
