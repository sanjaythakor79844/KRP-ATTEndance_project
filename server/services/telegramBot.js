import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import googleSheets from './googleSheets.js';

dotenv.config();

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.students = new Map();
    this.initialize();
  }

  async initialize() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
        return;
      }

      this.bot = new TelegramBot(token, { polling: true });
      console.log('✅ Telegram Bot initialized successfully');

      await this.loadStudents();
      this.setupHandlers();
    } catch (error) {
      console.error('❌ Error initializing Telegram Bot:', error.message);
    }
  }

  async loadStudents() {
    try {
      const students = await googleSheets.getStudents();
      students.forEach(student => {
        this.students.set(student.telegramId, student);
      });
      console.log(`✅ Loaded ${students.length} students from Google Sheets`);
    } catch (error) {
      console.error('❌ Error loading students:', error.message);
    }
  }

  setupHandlers() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username || msg.from.first_name;
      
      await this.bot.sendMessage(chatId, 
        `🎓 Welcome to KRP Admin Dashboard Bot!\n\n` +
        `Hello ${username}! 👋\n\n` +
        `Available Commands:\n` +
        `📝 /register - Register as a student\n` +
        `📊 /mystats - View your statistics\n` +
        `📚 /assignments - View your assignments\n` +
        `✅ /attendance - Mark attendance\n` +
        `❓ /help - Show help menu\n\n` +
        `Get started by registering with /register`
      );

      await googleSheets.addLog({
        action: 'Bot Start',
        student: username,
        status: 'success',
        details: `User ${username} started the bot`
      });
    });

    // Register command
    this.bot.onText(/\/register/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id.toString();
      const username = msg.from.username || msg.from.first_name;

      if (this.students.has(telegramId)) {
        await this.bot.sendMessage(chatId, 
          `✅ You are already registered!\n\n` +
          `Name: ${this.students.get(telegramId).name}\n` +
          `Status: ${this.students.get(telegramId).status}\n` +
          `Assignment Limit: ${this.students.get(telegramId).assignmentLimit}`
        );
        return;
      }

      await this.bot.sendMessage(chatId, 
        `📝 Registration Process\n\n` +
        `Please send your full name in the format:\n` +
        `/setname Your Full Name`
      );
    });

    // Set name command
    this.bot.onText(/\/setname (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id.toString();
      const fullName = match[1];

      const studentData = {
        name: fullName,
        telegramId: telegramId,
        assignmentLimit: 3,
        status: 'active',
        totalAssignments: 0
      };

      const result = await googleSheets.addStudent(studentData);
      
      if (result.success) {
        this.students.set(telegramId, studentData);
        
        await this.bot.sendMessage(chatId, 
          `✅ Registration Successful!\n\n` +
          `Name: ${fullName}\n` +
          `Telegram ID: ${telegramId}\n` +
          `Assignment Limit: 3\n` +
          `Status: Active\n\n` +
          `You can now receive assignments and participate in attendance!`
        );

        await googleSheets.addLog({
          action: 'Student Registered',
          student: fullName,
          status: 'success',
          details: `New student registered with Telegram ID: ${telegramId}`
        });
      } else {
        await this.bot.sendMessage(chatId, 
          `❌ Registration failed. Please try again or contact admin.`
        );
      }
    });

    // My stats command
    this.bot.onText(/\/mystats/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id.toString();

      if (!this.students.has(telegramId)) {
        await this.bot.sendMessage(chatId, 
          `❌ You are not registered yet!\n\n` +
          `Please use /register to get started.`
        );
        return;
      }

      const student = this.students.get(telegramId);
      await this.bot.sendMessage(chatId, 
        `📊 Your Statistics\n\n` +
        `👤 Name: ${student.name}\n` +
        `🆔 Telegram ID: ${student.telegramId}\n` +
        `📝 Total Assignments: ${student.totalAssignments}\n` +
        `📊 Assignment Limit: ${student.assignmentLimit}\n` +
        `✅ Status: ${student.status.toUpperCase()}\n\n` +
        `Keep up the great work! 🎉`
      );
    });

    // Attendance command
    this.bot.onText(/\/attendance/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id.toString();

      if (!this.students.has(telegramId)) {
        await this.bot.sendMessage(chatId, 
          `❌ You are not registered yet!\n\n` +
          `Please use /register to get started.`
        );
        return;
      }

      const student = this.students.get(telegramId);
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Present', callback_data: 'attendance_present' },
            { text: '❌ Absent', callback_data: 'attendance_absent' }
          ]
        ]
      };

      await this.bot.sendMessage(chatId, 
        `📋 Attendance Marking\n\n` +
        `Student: ${student.name}\n` +
        `Please mark your attendance:`,
        { reply_markup: keyboard }
      );
    });

    // Callback query handler for attendance
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const telegramId = query.from.id.toString();
      const data = query.data;

      if (data.startsWith('attendance_')) {
        const status = data.replace('attendance_', '');
        const student = this.students.get(telegramId);

        if (student) {
          await googleSheets.addLog({
            action: 'Attendance Marked',
            student: student.name,
            status: 'success',
            details: `Student marked ${status}`,
            telegramMessageId: query.message.message_id.toString()
          });

          await this.bot.answerCallbackQuery(query.id, {
            text: `✅ Attendance marked as ${status}!`
          });

          await this.bot.editMessageText(
            `✅ Attendance Recorded\n\n` +
            `Student: ${student.name}\n` +
            `Status: ${status.toUpperCase()}\n` +
            `Time: ${new Date().toLocaleString()}\n\n` +
            `Thank you! 🎉`,
            {
              chat_id: chatId,
              message_id: query.message.message_id
            }
          );
        }
      }
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.bot.sendMessage(chatId, 
        `📚 Help Menu\n\n` +
        `Available Commands:\n\n` +
        `🔹 /start - Start the bot\n` +
        `🔹 /register - Register as a student\n` +
        `🔹 /setname <name> - Set your full name\n` +
        `🔹 /mystats - View your statistics\n` +
        `🔹 /assignments - View assignments\n` +
        `🔹 /attendance - Mark attendance\n` +
        `🔹 /help - Show this menu\n\n` +
        `For any issues, contact your admin.`
      );
    });

    // Error handler
    this.bot.on('polling_error', (error) => {
      console.error('❌ Polling error:', error.message);
    });

    console.log('✅ Bot handlers setup complete');
  }

  // Send assignment to student
  async sendAssignment(telegramId, assignmentData) {
    try {
      const message = 
        `📝 New Assignment!\n\n` +
        `Project: ${assignmentData.projectName}\n` +
        `Description: ${assignmentData.description}\n` +
        `Deadline: ${assignmentData.deadline}\n` +
        `Priority: ${assignmentData.priority}\n\n` +
        `Good luck! 🚀`;

      const sentMessage = await this.bot.sendMessage(telegramId, message);

      await googleSheets.addLog({
        action: 'Assignment Sent',
        student: this.students.get(telegramId)?.name || 'Unknown',
        assignedCount: 1,
        status: 'success',
        details: `Assignment for ${assignmentData.projectName}`,
        telegramMessageId: sentMessage.message_id.toString()
      });

      return { success: true, messageId: sentMessage.message_id };
    } catch (error) {
      console.error('❌ Error sending assignment:', error.message);
      
      await googleSheets.addLog({
        action: 'Assignment Failed',
        student: this.students.get(telegramId)?.name || 'Unknown',
        status: 'failed',
        details: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Send broadcast message
  async sendBroadcast(message, targetStudents = 'all') {
    try {
      let recipients = [];
      
      if (targetStudents === 'all') {
        recipients = Array.from(this.students.keys());
      } else if (targetStudents === 'active') {
        recipients = Array.from(this.students.entries())
          .filter(([_, student]) => student.status === 'active')
          .map(([id, _]) => id);
      } else if (Array.isArray(targetStudents)) {
        recipients = targetStudents;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const telegramId of recipients) {
        try {
          await this.bot.sendMessage(telegramId, 
            `📢 Broadcast Message\n\n${message}`
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${telegramId}:`, error.message);
          failedCount++;
        }
      }

      await googleSheets.addBroadcast({
        message: message,
        sentTo: targetStudents,
        status: 'sent',
        successCount: successCount,
        failedCount: failedCount
      });

      await googleSheets.addLog({
        action: 'Broadcast Sent',
        student: `All eligible (${successCount})`,
        status: 'success',
        details: `Broadcast sent to ${successCount} students, ${failedCount} failed`
      });

      return { 
        success: true, 
        successCount, 
        failedCount,
        total: recipients.length 
      };
    } catch (error) {
      console.error('❌ Error sending broadcast:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send attendance trigger
  async sendAttendanceTrigger(attendanceData) {
    try {
      const message = 
        `📋 Attendance Alert!\n\n` +
        `Class: ${attendanceData.className}\n` +
        `Date: ${attendanceData.date}\n` +
        `Time: ${attendanceData.time}\n` +
        `Manager: ${attendanceData.manager}\n\n` +
        `Please mark your attendance using /attendance command.`;

      const activeStudents = Array.from(this.students.entries())
        .filter(([_, student]) => student.status === 'active')
        .map(([id, _]) => id);

      let successCount = 0;
      let failedCount = 0;

      for (const telegramId of activeStudents) {
        try {
          await this.bot.sendMessage(telegramId, message);
          successCount++;
        } catch (error) {
          console.error(`Failed to send attendance to ${telegramId}:`, error.message);
          failedCount++;
        }
      }

      await googleSheets.addAttendance({
        ...attendanceData,
        status: 'sent',
        totalStudents: activeStudents.length,
        attendedCount: 0
      });

      await googleSheets.addLog({
        action: 'Attendance Trigger Sent',
        student: `All active (${successCount})`,
        status: 'success',
        details: `Attendance trigger for ${attendanceData.className}`
      });

      return { 
        success: true, 
        successCount, 
        failedCount,
        total: activeStudents.length 
      };
    } catch (error) {
      console.error('❌ Error sending attendance trigger:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get bot info
  getBotInfo() {
    return {
      isRunning: this.bot !== null,
      studentsCount: this.students.size,
      botUsername: process.env.TELEGRAM_BOT_USERNAME
    };
  }

  // Reload students from Google Sheets
  async reloadStudents() {
    await this.loadStudents();
    return { success: true, count: this.students.size };
  }
}

export default new TelegramBotService();
