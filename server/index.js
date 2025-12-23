import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import telegramBot from './services/telegramBot.js';
import googleSheets from './services/googleSheets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const botInfo = telegramBot.getBotInfo();
  res.json({
    status: 'running',
    bot: botInfo,
    timestamp: new Date().toISOString()
  });
});

// Students endpoints
app.get('/api/students', async (req, res) => {
  try {
    const students = await googleSheets.getStudents();
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const result = await googleSheets.addStudent(req.body);
    if (result.success) {
      await telegramBot.reloadStudents();
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/students/:index', async (req, res) => {
  try {
    const result = await googleSheets.updateStudent(parseInt(req.params.index), req.body);
    if (result.success) {
      await telegramBot.reloadStudents();
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await googleSheets.getProjects();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const result = await googleSheets.addProject(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Attendance endpoints
app.get('/api/attendance', async (req, res) => {
  try {
    const attendance = await googleSheets.getAttendance();
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const result = await googleSheets.addAttendance(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/attendance/trigger', async (req, res) => {
  try {
    const result = await telegramBot.sendAttendanceTrigger(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logs endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const logs = await googleSheets.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const result = await googleSheets.addLog(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast endpoints
app.post('/api/broadcast', async (req, res) => {
  try {
    const { message, targetStudents } = req.body;
    const result = await telegramBot.sendBroadcast(message, targetStudents);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Templates endpoints
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await googleSheets.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const result = await googleSheets.addTemplate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assignment endpoints
app.post('/api/assignments/send', async (req, res) => {
  try {
    const { telegramId, assignmentData } = req.body;
    const result = await telegramBot.sendAssignment(telegramId, assignmentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize sheets endpoint
app.post('/api/sheets/initialize', async (req, res) => {
  try {
    const result = await googleSheets.initializeSheets();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bot info endpoint
app.get('/api/bot/info', (req, res) => {
  try {
    const info = telegramBot.getBotInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reload students endpoint
app.post('/api/bot/reload-students', async (req, res) => {
  try {
    const result = await telegramBot.reloadStudents();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scheduled tasks using cron
// Example: Daily summary at 6 PM
cron.schedule('0 18 * * *', async () => {
  console.log('📊 Running daily summary task...');
  try {
    const logs = await googleSheets.getLogs(50);
    const students = await googleSheets.getStudents();
    
    const summary = 
      `📊 Daily Summary Report\n\n` +
      `Total Students: ${students.length}\n` +
      `Active Students: ${students.filter(s => s.status === 'active').length}\n` +
      `Today's Activities: ${logs.filter(l => {
        const logDate = new Date(l.timestamp).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
      }).length}\n\n` +
      `Keep up the great work! 🎉`;
    
    await telegramBot.sendBroadcast(summary, 'active');
    console.log('✅ Daily summary sent successfully');
  } catch (error) {
    console.error('❌ Error sending daily summary:', error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🤖 KRP Telegram Bot Server                         ║
║                                                       ║
║   ✅ Server running on port ${PORT}                     ║
║   ✅ Telegram Bot initialized                         ║
║   ✅ Google Sheets connected                          ║
║   ✅ Scheduled tasks active                           ║
║                                                       ║
║   API Endpoints:                                      ║
║   - GET  /api/health                                  ║
║   - GET  /api/students                                ║
║   - POST /api/students                                ║
║   - GET  /api/projects                                ║
║   - POST /api/projects                                ║
║   - GET  /api/attendance                              ║
║   - POST /api/attendance/trigger                      ║
║   - GET  /api/logs                                    ║
║   - POST /api/broadcast                               ║
║   - GET  /api/templates                               ║
║   - POST /api/assignments/send                        ║
║   - POST /api/sheets/initialize                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});
