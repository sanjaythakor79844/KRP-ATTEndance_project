import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing services
dotenv.config();

// Debug: Check if env variables are loaded
console.log('🔍 Environment check:');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded ✅' : 'Missing ❌');
console.log('  PORT:', process.env.PORT || '5000');

import gmailService from './services/gmailService.js';
import mongoService from './services/mongoService.js';
import attendanceTrackingService from './services/attendanceTrackingService.js';
import attendanceScheduler from './services/attendanceSchedulerService.js';


// Initialize MongoDB
let students = [];
let projects = [];
let attendance = [];
let logs = [];
let templates = [];

// Load initial data from MongoDB
const loadInitialData = async () => {
  try {
    await mongoService.connect();
    students = await mongoService.getStudents();
    projects = await mongoService.getProjects();
    attendance = await mongoService.getAttendance();
    logs = await mongoService.getLogs();
    templates = await mongoService.getTemplates();
    console.log('✅ Data loaded from MongoDB');
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
    console.log('⚠️ Using empty fallback data');
    console.log('💡 Data will not persist - add students/projects manually');
    // Batch A Students - January 2026 (Sanjay & Shyanjali are admins, not students)
    students = [
      { id: '1', name: 'Dakshi Kocharekar', email: 'dakshikocharekar6@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '2', name: 'Bhavna', email: 'bhavna.mail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '3', name: 'Shafaq', email: 'shafaqsultana@hotmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '4', name: 'Sarah', email: 'Sarahzakir91@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '5', name: 'Vaibhavi', email: 'Bhanavibhavi@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '6', name: 'Rishakha', email: 'Rishakhattri@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '7', name: 'Simran', email: 'd.simranbothra@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '8', name: 'Harshi', email: 'harshey.agarwal@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '9', name: 'Sangeeta', email: 'madamtutusingsoccer@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '10', name: 'Vrindanti', email: 'Ambrevadanti97@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '11', name: 'Mayra', email: 'Manmukunda|wal.978@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '12', name: 'Kanishka', email: 'kanishkasewairamani@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '13', name: 'Prachika', email: 'Mehtaprachika96@gmail.com', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '14', name: 'Aviva', email: '', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
      { id: '15', name: 'Khushi', email: '', assignmentLimit: 5, currentAssignments: 0, status: 'active', batch: 'A', createdAt: new Date().toISOString() },
    ];
    projects = [];
    attendance = [];
    logs = [];
    templates = [
      { id: '1', name: 'Attendance Reminder', content: '📋 Good morning! Please mark your attendance for today.\n\nLogin to dashboard and mark Present/Absent/Late for each student.\n\nThank you!', createdAt: new Date().toISOString() },
      { id: '2', name: 'Project Assignment', content: '📊 New project assigned to you!\n\nPlease check the dashboard for details and confirm your availability.\n\nThank you!', createdAt: new Date().toISOString() },
      { id: '3', name: 'Weekly Report', content: '📈 Weekly Report Request\n\nPlease submit your weekly progress report by end of day.\n\nThank you!', createdAt: new Date().toISOString() },
    ];
    console.log('✅ Added 15 Batch A students');
    console.log('✅ Added 3 default templates');
    console.log('✅ Clean start - no testing data');
  }
};

loadInitialData();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://krp-att-endance-project.vercel.app',
    'https://krp-att-endance-project-*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const gmailStatus = gmailService.isConnected();
  const gmailUser = gmailService.getUserInfo();
  
  res.json({
    status: 'running',
    gmail: {
      connected: gmailStatus,
      user: gmailUser
    },
    timestamp: new Date().toISOString()
  });
});

// Students endpoints
app.get('/api/students', async (req, res) => {
  try {
    const studentsFromDB = await mongoService.getStudents();
    res.json({ success: true, data: studentsFromDB });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const result = await mongoService.addStudent(req.body);
    if (result.success) {
      await mongoService.addLog({
        action: 'Student Added',
        details: `Student ${req.body.name} was added`,
      });
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const result = await mongoService.updateStudent(req.params.id, req.body);
    if (result.success) {
      const student = await mongoService.getStudentById(req.params.id);
      await mongoService.addLog({
        action: 'Student Updated',
        details: `Student ${student.name} was updated`,
      });
      res.json({ success: true, data: student });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await mongoService.getStudentById(req.params.id);
    const result = await mongoService.deleteStudent(req.params.id);
    if (result.success) {
      await mongoService.addLog({
        action: 'Student Deleted',
        details: `Student ${student.name} was deleted`,
      });
      res.json({ success: true });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const projectsFromDB = await mongoService.getProjects();
    res.json({ success: true, data: projectsFromDB });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const result = await mongoService.addProject(req.body);
    if (result.success) {
      await mongoService.addLog({
        action: 'Project Created',
        details: `Project ${req.body.title} was created`,
      });
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const result = await mongoService.updateProject(req.params.id, req.body);
    if (result.success) {
      const project = await mongoService.getProjectById(req.params.id);
      await mongoService.addLog({
        action: 'Project Updated',
        details: `Project ${project.title} was updated`,
      });
      res.json({ success: true, data: project });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await mongoService.getProjectById(req.params.id);
    const result = await mongoService.deleteProject(req.params.id);
    if (result.success) {
      await mongoService.addLog({
        action: 'Project Deleted',
        details: `Project ${project.title} was deleted`,
      });
      res.json({ success: true });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get project responses from logs
app.get('/api/projects/responses', async (req, res) => {
  try {
    const logs = await mongoService.getLogs(1000);
    const responses = logs
      .filter(log => log.action === 'Project Response')
      .map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        details: log.details,
        action: log.action
      }));
    
    res.json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/projects/send', async (req, res) => {
  try {
    const { projectId, studentIds } = req.body;
    const project = await mongoService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check Gmail connection first
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    // Import email templates
    const emailTemplates = (await import('./templates/emailTemplates.js')).default;

    // Send emails to selected students and track assignments
    let successCount = 0;
    const errors = [];
    const sentTo = [];
    
    for (const studentId of studentIds) {
      const student = await mongoService.getStudentById(studentId);
      if (student && student.status === 'active' && student.email) {
        try {
          // Check if student has reached assignment limit
          if (student.currentAssignments >= student.assignmentLimit) {
            errors.push(`${student.name}: Assignment limit reached (${student.assignmentLimit})`);
            continue;
          }

          // Use professional project assignment template
          console.log('🔍 DEBUG: Sending project email');
          console.log('  BACKEND_URL env:', process.env.BACKEND_URL);
          console.log('  FRONTEND_URL env:', process.env.FRONTEND_URL);
          console.log('  serverUrl will be:', process.env.BACKEND_URL || 'https://krp-attendance-project.onrender.com');
          console.log('  dashboardUrl will be:', process.env.FRONTEND_URL || 'https://krp-att-endance-project.vercel.app');
          
          const html = emailTemplates.projectAssignment({
            studentName: student.name,
            studentId: student.id,
            projectId: project.id,
            projectTitle: project.title,
            description: project.description || 'No description provided',
            deadline: project.date,
            location: project.location || 'See dashboard for details',
            requirements: project.requirements || '',
            dashboardUrl: process.env.FRONTEND_URL || 'https://krp-att-endance-project.vercel.app',
            serverUrl: process.env.BACKEND_URL || 'https://krp-attendance-project.onrender.com'
          });
          
          const subject = `📢 New Project Assignment: ${project.title}`;
          
          await gmailService.sendEmail(student.email, subject, html);
          
          // Track the assignment
          await mongoService.addProjectAssignment({
            projectId: project.id,
            projectTitle: project.title,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            status: 'pending', // pending, accepted, declined
            sentAt: new Date().toISOString()
          });
          
          sentTo.push(student.name);
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${student.name}:`, error);
          errors.push(`${student.name}: ${error.message}`);
        }
      }
    }

    await mongoService.addLog({
      action: 'Project Sent',
      details: `Project "${project.title}" sent to ${successCount} students: ${sentTo.join(', ')}${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
    });

    res.json({ 
      success: true, 
      message: `Project sent to ${successCount} students`,
      sentTo: sentTo,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Project response endpoint (Accept/Decline/Skip)
app.post('/api/projects/response', async (req, res) => {
  try {
    const { projectId, studentId, response } = req.body;
    
    if (!projectId || !studentId || !response) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project ID, Student ID, and response are required' 
      });
    }

    const project = await mongoService.getProjectById(projectId);
    const student = await mongoService.getStudentById(studentId);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Log the response
    await mongoService.addLog({
      action: 'Project Response',
      details: `${student.name} ${response} project: ${project.title}`,
      studentId: student.id
    });

    // Send confirmation email
    if (gmailService.isConnected() && student.email) {
      try {
        // Import email templates
        const emailTemplates = (await import('./templates/emailTemplates.js')).default;
        
        // Use professional project response template
        const html = emailTemplates.projectResponse({
          studentName: student.name,
          projectTitle: project.title,
          response: response,
          dashboardUrl: 'http://localhost:5173'
        });
        
        const subjectMap = {
          accept: `✅ Project Accepted: ${project.title}`,
          decline: `❌ Project Declined: ${project.title}`,
          skip: `⏭️ Project Skipped: ${project.title}`
        };
        
        const subject = subjectMap[response] || `Project Response: ${project.title}`;
        
        await gmailService.sendEmail(student.email, subject, html);
        console.log(`✅ Confirmation email sent to ${student.name}`);
      } catch (error) {
        console.error(`❌ Failed to send confirmation email:`, error);
      }
    }

    res.json({ 
      success: true, 
      message: `Project ${response} successfully`,
      response: response
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Project response via email link (GET request from email buttons)
app.get('/api/projects/respond', async (req, res) => {
  try {
    const { projectId, studentId, response } = req.query;
    
    if (!projectId || !studentId || !response) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Request</h1>
            <p>Missing required parameters</p>
          </div>
        </body>
        </html>
      `);
    }

    const project = await mongoService.getProjectById(projectId);
    const student = await mongoService.getStudentById(studentId);
    
    if (!project || !student) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Not Found</h1>
            <p>Project or student not found</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check if project is already full (assistants required limit reached)
    const assignments = await mongoService.getProjectAssignments(projectId);
    const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
    
    if (response === 'accept' && acceptedCount >= project.assistantsRequired) {
      // Project is full - too late!
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Project Full</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
              max-width: 500px;
            }
            .icon { font-size: 80px; margin-bottom: 20px; }
            h1 { margin: 0 0 20px 0; font-size: 32px; }
            p { font-size: 18px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>Project Full!</h1>
            <p><strong>${student.name}</strong></p>
            <p>Sorry, the project <strong>${project.title}</strong> has already been filled.</p>
            <p>All ${project.assistantsRequired} positions have been accepted by other students.</p>
            <p style="margin-top: 30px; font-size: 14px;">Better luck next time!</p>
          </div>
        </body>
        </html>
      `);
    }

    // Update assignment status
    await mongoService.updateProjectAssignment(projectId, studentId, {
      status: response,
      respondedAt: new Date().toISOString()
    });

    // If accepted, increment student's current assignments
    if (response === 'accept') {
      const updatedStudent = {
        ...student,
        currentAssignments: (student.currentAssignments || 0) + 1
      };
      await mongoService.updateStudent(studentId, { currentAssignments: updatedStudent.currentAssignments });
    }

    // Log the response
    await mongoService.addLog({
      action: 'Project Response',
      details: `${student.name} ${response}ed project: ${project.title}`,
    });

    // Send confirmation email
    if (gmailService.isConnected() && student.email) {
      try {
        const emailTemplates = (await import('./templates/emailTemplates.js')).default;
        
        const html = emailTemplates.projectResponse({
          studentName: student.name,
          projectTitle: project.title,
          response: response,
          dashboardUrl: 'http://localhost:5173'
        });
        
        const subjectMap = {
          accept: `✅ Project Accepted: ${project.title}`,
          decline: `❌ Project Declined: ${project.title}`
        };
        
        const subject = subjectMap[response] || `Project Response: ${project.title}`;
        
        await gmailService.sendEmail(student.email, subject, html);
        console.log(`✅ Confirmation email sent to ${student.name}`);
      } catch (error) {
        console.error(`❌ Failed to send confirmation email:`, error);
      }
    }

    // Return success page
    const responseColors = {
      accept: { bg: '#10b981', text: 'Accepted' },
      decline: { bg: '#ef4444', text: 'Declined' }
    };
    
    const color = responseColors[response] || { bg: '#3b82f6', text: response };
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Response Recorded</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, ${color.bg} 0%, ${adjustColorHex(color.bg, -20)} 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 500px;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 20px 0;
            font-size: 32px;
          }
          p {
            font-size: 18px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${response === 'accept' ? '✅' : '❌'}</div>
          <h1>Response Recorded!</h1>
          <p><strong>${student.name}</strong></p>
          <p>You have <strong>${color.text}</strong> the project:</p>
          <p><strong>${project.title}</strong></p>
          <p style="margin-top: 30px; font-size: 14px;">A confirmation email has been sent to you.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error handling project response:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error</h1>
          <p>${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Helper function for color adjustment
function adjustColorHex(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Attendance endpoints
app.get('/api/attendance/mark-email', async (req, res) => {
  try {
    const { studentId, status, managerId, date } = req.query;
    
    if (!studentId || !status || !managerId || !date) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Request</h1>
            <p>Missing required parameters</p>
          </div>
        </body>
        </html>
      `);
    }

    const student = await mongoService.getStudentById(studentId);
    if (!student) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Student Not Found</h1>
            <p>The student could not be found</p>
          </div>
        </body>
        </html>
      `);
    }

    // Mark attendance
    const result = await attendanceTrackingService.markAttendance(
      studentId,
      student.name,
      student.email,
      date,
      status,
      'General Class'
    );

    if (result.success) {
      await mongoService.addLog({
        action: 'Attendance Marked',
        details: `${student.name} marked as ${status} (via email)`,
      });
    }

    // Return success page
    const statusColors = {
      present: { bg: '#10b981', text: 'Present', icon: '✅' },
      absent: { bg: '#ef4444', text: 'Absent', icon: '❌' },
      late: { bg: '#f59e0b', text: 'Late', icon: '⏰' }
    };
    
    const color = statusColors[status] || { bg: '#3b82f6', text: status, icon: '📝' };
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Marked</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, ${color.bg} 0%, ${adjustColorHex(color.bg, -20)} 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 500px;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 20px 0;
            font-size: 32px;
          }
          p {
            font-size: 18px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${color.icon}</div>
          <h1>Attendance Marked!</h1>
          <p><strong>${student.name}</strong></p>
          <p>Status: <strong>${color.text}</strong></p>
          <p>Date: <strong>${new Date(date).toLocaleDateString()}</strong></p>
          <p style="margin-top: 30px; font-size: 14px;">Attendance has been recorded successfully.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error marking attendance from email:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error</h1>
          <p>${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
});

app.get('/api/attendance/managers', async (req, res) => {
  try {
    const managers = await mongoService.getAttendanceManagers();
    res.json({ success: true, data: managers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new attendance manager
app.post('/api/attendance/managers', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and email are required' 
      });
    }

    const newManager = {
      id: `mgr${Date.now()}`,
      _id: `mgr${Date.now()}`,
      name,
      email,
      role: 'manager',
      createdAt: new Date().toISOString()
    };

    // Add to fallback data (will be saved to MongoDB if connected)
    const result = await mongoService.addAttendanceManager(newManager);
    
    if (result.success) {
      await mongoService.addLog({
        action: 'Manager Added',
        details: `New attendance manager added: ${name} (${email})`,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const attendanceFromDB = await mongoService.getAttendance();
    res.json({ success: true, data: attendanceFromDB });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const result = await mongoService.addAttendance(req.body);
    if (result.success) {
      await mongoService.addLog({
        action: 'Attendance Recorded',
        details: `Attendance recorded for ${req.body.studentId}`,
      });
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/attendance/trigger', async (req, res) => {
  try {
    // Check Gmail connection first
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    const { message, subject } = req.body;
    const studentsFromDB = await mongoService.getStudents();
    const activeStudents = studentsFromDB.filter(s => s.status === 'active' && s.email);
    
    let successCount = 0;
    const errors = [];
    
    const template = gmailService.createEmailTemplate('attendance', {});
    const emailSubject = subject || template.subject;
    const emailHtml = message || template.html;
    
    for (const student of activeStudents) {
      try {
        await gmailService.sendEmail(student.email, emailSubject, emailHtml);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${student.name}:`, error);
        errors.push(`${student.name}: ${error.message}`);
      }
    }

    await mongoService.addLog({
      action: 'Attendance Trigger Sent',
      details: `Attendance reminder sent to ${successCount} students${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
    });

    res.json({ 
      success: true, 
      message: `Attendance reminder sent to ${successCount} students`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ATTENDANCE TRACKING ENDPOINTS ====================

// Mark attendance for a student
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { studentId, status, date, className } = req.body;
    
    if (!studentId || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID and status are required' 
      });
    }

    const student = await mongoService.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const result = await attendanceTrackingService.markAttendance(
      studentId,
      student.name,
      student.email,
      date,
      status,
      className
    );

    if (result.success) {
      await mongoService.addLog({
        action: 'Attendance Marked',
        details: `${student.name} marked as ${status}`,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance summary for a student
app.get('/api/attendance/summary/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await mongoService.getStudentById(studentId);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const summary = await attendanceTrackingService.calculateAttendance(studentId);
    
    res.json({ 
      success: true, 
      data: {
        ...summary,
        studentName: student.name,
        studentEmail: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance summaries for all students
app.get('/api/attendance/all-summaries', async (req, res) => {
  try {
    const studentsFromDB = await mongoService.getStudents();
    const summaries = [];
    
    for (const student of studentsFromDB) {
      const summary = await attendanceTrackingService.calculateAttendance(student.id);
      summaries.push({
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        status: student.status,
        ...summary
      });
    }
    
    res.json({ success: true, data: summaries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check attendance and send notifications
app.post('/api/attendance/check-and-notify', async (req, res) => {
  try {
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    const studentsFromDB = await mongoService.getStudents();
    const activeStudents = studentsFromDB.filter(s => s.status === 'active' && s.email);
    
    let notificationsSent = 0;
    const results = [];
    
    for (const student of activeStudents) {
      // Calculate attendance summary for this student
      const summary = await attendanceTrackingService.calculateAttendance(student.id);
      
      // Only send if student has attendance records
      if (summary.totalDays > 0) {
        const result = await attendanceTrackingService.sendAttendanceNotification(student, summary);
        
        if (result.success) {
          notificationsSent++;
          const type = summary.percentage < 80 ? 'Warning' : 'Congratulations';
          results.push({
            student: student.name,
            type: type,
            percentage: summary.percentage
          });
          
          await mongoService.addLog({
            action: 'Attendance Notification',
            details: `${type} email sent to ${student.name} (${summary.percentage}%)`,
          });
        }
      }
    }
    
    if (notificationsSent === 0) {
      return res.json({ 
        success: true, 
        message: 'No notifications sent - no attendance records found',
        results: []
      });
    }
    
    res.json({ 
      success: true, 
      message: `Sent ${notificationsSent} notifications`,
      results: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cleanup duplicate attendance records
app.post('/api/attendance/cleanup-duplicates', async (req, res) => {
  try {
    const result = await attendanceTrackingService.cleanupDuplicates();
    
    if (result.success) {
      await mongoService.addLog({
        action: 'Attendance Cleanup',
        details: `Removed ${result.duplicatesRemoved} duplicate attendance records`,
      });
      
      res.json({ 
        success: true, 
        message: `Cleanup complete: ${result.duplicatesRemoved} duplicate records removed`,
        duplicatesRemoved: result.duplicatesRemoved
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger automatic attendance check manually (for testing)
app.post('/api/attendance/trigger-automatic', async (req, res) => {
  try {
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected',
        needsAuth: true
      });
    }

    const result = await attendanceScheduler.triggerNow();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Automatic check completed: ${result.sent} reminders sent, ${result.skipped} skipped`,
        sent: result.sent,
        skipped: result.skipped
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get today's attendance summary
app.get('/api/attendance/today', async (req, res) => {
  try {
    const studentsFromDB = await mongoService.getStudents();
    const summary = attendanceTrackingService.getTodaysSummary(studentsFromDB);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available dates with attendance records
app.get('/api/attendance/available-dates', async (req, res) => {
  try {
    const attendanceRecords = await mongoService.getAttendance();
    
    // Group by date and count records
    const dateMap = new Map();
    attendanceRecords.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, count: 0, records: [] });
      }
      const dateInfo = dateMap.get(date);
      dateInfo.count++;
      dateInfo.records.push(record);
    });
    
    // Convert to array and sort by date (newest first)
    const dates = Array.from(dateMap.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(d => ({
        date: d.date,
        displayDate: new Date(d.date).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        count: d.count
      }));
    
    res.json({ success: true, data: dates });
  } catch (error) {
    console.error('Error getting available dates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance by specific date
app.get('/api/attendance/by-date', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, error: 'Date parameter required' });
    }
    
    let targetDate;
    if (date === 'today') {
      targetDate = new Date().toISOString().split('T')[0];
    } else {
      targetDate = date;
    }
    
    // Get all attendance records
    const attendanceRecords = await mongoService.getAttendance();
    
    // Filter by date
    const dateRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      return recordDate === targetDate;
    });
    
    // Remove duplicates - keep only the latest record for each student
    const uniqueRecords = new Map();
    dateRecords.forEach(record => {
      const existing = uniqueRecords.get(record.studentId);
      if (!existing || new Date(record.timestamp) > new Date(existing.timestamp)) {
        uniqueRecords.set(record.studentId, record);
      }
    });
    
    const uniqueDateRecords = Array.from(uniqueRecords.values());
    
    // Get student details
    const students = await mongoService.getStudents();
    
    // Enrich records with student info
    const enrichedRecords = uniqueDateRecords.map(record => {
      const student = students.find(s => s.id === record.studentId);
      return {
        studentId: record.studentId,
        studentName: student ? student.name : 'Unknown',
        studentEmail: student ? student.email : 'Unknown',
        status: record.status,
        timestamp: record.timestamp
      };
    });
    
    // Sort by student name
    enrichedRecords.sort((a, b) => a.studentName.localeCompare(b.studentName));
    
    res.json({ success: true, data: enrichedRecords });
  } catch (error) {
    console.error('Error getting attendance by date:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send attendance reminder to manager
app.post('/api/attendance/send-manager-reminder', async (req, res) => {
  try {
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    const { managerId } = req.body;
    
    // Get manager details from attendance managers
    const managers = await mongoService.getAttendanceManagers();
    const manager = managers.find(m => m.id === managerId);
    
    if (!manager || !manager.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Manager not found or no email address' 
      });
    }

    // Get all active students
    const studentsFromDB = await mongoService.getStudents();
    const activeStudents = studentsFromDB.filter(s => s.status === 'active');

    // Import email templates
    const emailTemplates = (await import('./templates/emailTemplates.js')).default;

    // Create professional email using template
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const html = emailTemplates.attendanceManagerReminder({
      managerName: manager.name,
      managerId: manager.id,
      date: today,
      students: activeStudents.map(s => ({ id: s.id, name: s.name, email: s.email })),
      dashboardUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      serverUrl: process.env.BACKEND_URL || 'http://localhost:5000'
    });

    const subject = `📋 Attendance Reminder - ${today}`;

    // Send email
    await gmailService.sendEmail(manager.email, subject, html);

    // Log the action
    await mongoService.addLog({
      action: 'Attendance Manager Reminder',
      details: `Reminder sent to ${manager.name} (${manager.email})`,
    });

    res.json({ 
      success: true, 
      message: `Reminder sent to ${manager.name}` 
    });
  } catch (error) {
    console.error('Error sending manager reminder:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast endpoints
app.post('/api/broadcast', async (req, res) => {
  try {
    // Check Gmail connection first
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    const { message, subject, studentIds } = req.body;
    
    let successCount = 0;
    const errors = [];
    
    for (const studentId of studentIds) {
      const student = await mongoService.getStudentById(studentId);
      if (student && student.status === 'active' && student.email) {
        try {
          const template = gmailService.createEmailTemplate('broadcast', {
            subject: subject || '📢 Important Announcement',
            message: message
          });
          
          await gmailService.sendEmail(student.email, template.subject, template.html);
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${student.name}:`, error);
          errors.push(`${student.name}: ${error.message}`);
        }
      }
    }

    await mongoService.addLog({
      action: 'Broadcast Sent',
      details: `Broadcast sent to ${successCount} students${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
    });

    res.json({ 
      success: true, 
      message: `Broadcast sent to ${successCount} students`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Templates endpoints
app.get('/api/templates', async (req, res) => {
  try {
    const templatesFromDB = await mongoService.getTemplates();
    res.json({ success: true, data: templatesFromDB });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const result = await mongoService.addTemplate(req.body);
    if (result.success) {
      await mongoService.addLog({
        action: 'Template Created',
        details: `Template ${req.body.name} was created`,
      });
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logs endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const logsFromDB = await mongoService.getLogs();
    res.json({ success: true, data: logsFromDB });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== GMAIL ENDPOINTS ====================

// Gmail Status
app.get('/api/gmail/status', async (req, res) => {
  try {
    const status = gmailService.getStatus();
    const userInfo = gmailService.getUserInfo();
    
    res.json({
      success: true,
      connected: gmailService.isConnected(),
      user: userInfo,
      authUrl: status.authUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting Gmail status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      connected: false 
    });
  }
});

// Get Gmail Auth URL
app.get('/api/gmail/auth-url', async (req, res) => {
  try {
    const isConnected = gmailService.isConnected();
    const userInfo = gmailService.getUserInfo();

    if (isConnected) {
      return res.json({ 
        success: true,
        connected: true, 
        message: 'Gmail already connected',
        user: userInfo
      });
    }

    const authUrl = gmailService.getAuthUrl();
    
    res.json({
      success: true,
      connected: false,
      authUrl: authUrl,
      message: 'Please visit this URL to authenticate'
    });
  } catch (error) {
    console.error('❌ Error getting auth URL:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to get auth URL'
    });
  }
});

// Gmail Authentication Callback
app.get('/api/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authentication Error</h1>
            <p>No authorization code provided</p>
            <a href="http://localhost:3000" style="color: white;">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    const result = await gmailService.authenticate(code);
    
    if (result.success) {
      await mongoService.addLog({
        action: 'Gmail Connected',
        details: `Gmail connected: ${result.email}`,
      });
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Gmail Connected ✅</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            }
            .container {
              text-align: center;
              background: white;
              padding: 60px 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .success-icon {
              font-size: 80px;
              margin-bottom: 20px;
            }
            h1 {
              color: #11998e;
              margin-bottom: 10px;
            }
            .user-info {
              color: #666;
              font-size: 18px;
              margin: 20px 0;
            }
            .btn {
              margin-top: 30px;
              padding: 12px 30px;
              background: #11998e;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Gmail Connected!</h1>
            <div class="user-info">
              Connected as: <strong>${result.email}</strong>
            </div>
            <p>Your Gmail is connected and ready to send emails.</p>
            <a href="http://localhost:3000" class="btn">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    } else {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authentication Failed</h1>
            <p>${result.error}</p>
            <a href="http://localhost:3000" style="color: white;">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('❌ Error in callback:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error</h1>
          <p>${error.message}</p>
          <a href="http://localhost:3000" style="color: white;">Go to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Send Gmail Message
app.post('/api/gmail/send', async (req, res) => {
  try {
    // Check connection first
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    const { email, subject, message } = req.body;
    
    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Email, subject, and message are required'
      });
    }

    await gmailService.sendEmail(email, subject, message);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      to: email
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Disconnect from Gmail
app.post('/api/gmail/disconnect', async (req, res) => {
  try {
    await gmailService.disconnect();
    await mongoService.addLog({
      action: 'Gmail Disconnected',
      details: 'Gmail disconnected from dashboard',
    });
    res.json({ 
      success: true,
      message: 'Disconnected successfully. Authenticate again to reconnect.'
    });
  } catch (error) {
    console.error('❌ Error disconnecting Gmail:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🤖 KRP Gmail Server                                ║
║                                                       ║
║   ✅ Server running on port ${PORT}                     ║
║   ✅ Gmail Service initializing...                    ║
║                                                       ║
║   API Endpoints:                                      ║
║   - GET  /api/health                                  ║
║   - GET  /api/students                                ║
║   - POST /api/students                                ║
║   - GET  /api/projects                                ║
║   - POST /api/projects                                ║
║   - POST /api/projects/send                           ║
║   - GET  /api/attendance                              ║
║   - POST /api/attendance/trigger                      ║
║   - GET  /api/logs                                    ║
║   - POST /api/broadcast                               ║
║   - GET  /api/templates                               ║
║   - POST /api/templates                               ║
║   - GET  /api/gmail/status ⭐                         ║
║   - GET  /api/gmail/auth-url ⭐                       ║
║   - GET  /api/gmail/callback ⭐                       ║
║   - POST /api/gmail/send                              ║
║   - POST /api/gmail/disconnect                        ║
║                                                       ║
║   📧 Gmail Integration Active                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Initialize Gmail with error handling
  try {
    await gmailService.initialize();
  } catch (error) {
    console.log('⚠️ Gmail service failed to initialize, but server continues running');
    console.log('⚠️ You can connect Gmail later via the dashboard');
  }

  // Cleanup duplicate attendance records on startup
  try {
    console.log('🧹 Running attendance duplicate cleanup...');
    const cleanupResult = await attendanceTrackingService.cleanupDuplicates();
    if (cleanupResult.success && cleanupResult.duplicatesRemoved > 0) {
      console.log(`✅ Removed ${cleanupResult.duplicatesRemoved} duplicate attendance records`);
    } else {
      console.log('✅ No duplicate attendance records found');
    }
  } catch (error) {
    console.log('⚠️ Attendance cleanup failed:', error.message);
  }

  // Start automatic attendance reminders after Gmail is ready
  setTimeout(() => {
    if (gmailService.isConnected()) {
      attendanceScheduler.startDailyReminders();
      console.log('📅 Automatic attendance reminders enabled');
      console.log('⏰ Daily check scheduled at 9:00 AM');
      console.log('💡 Students with < 80% attendance will receive reminders');
    } else {
      console.log('⚠️ Automatic reminders disabled - Gmail not connected');
    }
  }, 3000); // Increased to 3 seconds
});

// Attendance Automation Settings API
app.get('/api/settings/attendance-automation', (req, res) => {
  try {
    const settings = {
      enabled: attendanceScheduler.isEnabled,
      schedule: '9:00 AM daily',
      threshold: 80, // Percentage below which students get reminders
      lastRun: null, // TODO: Track last run time
      nextRun: '9:00 AM tomorrow'
    };
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/settings/attendance-automation', (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'enabled must be a boolean' 
      });
    }

    attendanceScheduler.setEnabled(enabled);
    
    if (enabled && gmailService.isConnected()) {
      // Restart scheduler if enabling
      attendanceScheduler.stopAll();
      attendanceScheduler.startDailyReminders();
    } else if (!enabled) {
      // Stop scheduler if disabling
      attendanceScheduler.stopAll();
    }

    res.json({ 
      success: true, 
      message: `Automatic attendance reminders ${enabled ? 'enabled' : 'disabled'}`,
      data: { enabled }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual trigger for attendance notifications
app.post('/api/attendance/trigger-auto-notifications', async (req, res) => {
  try {
    if (!gmailService.isConnected()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gmail not connected. Please authenticate first.',
        needsAuth: true
      });
    }

    const result = await attendanceScheduler.triggerNow();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Sent ${result.sent} notifications, skipped ${result.skipped} students`,
        data: result
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});