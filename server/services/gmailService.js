import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GmailService {
  constructor() {
    this.gmail = null;
    this.transporter = null;
    this.isAuthenticated = false;
    this.userEmail = null;
    this.oauth2Client = null;
    this.credentialsPath = path.join(__dirname, '../config/gmail-credentials.json');
    this.tokenPath = path.join(__dirname, '../config/gmail-token.json');
  }

  async initialize() {
    try {
      // Load credentials from environment variable or file
      let credentials;
      
      if (process.env.GMAIL_CREDENTIALS) {
        // Load from environment variable (production)
        console.log('📧 Loading Gmail credentials from environment variable');
        credentials = JSON.parse(process.env.GMAIL_CREDENTIALS);
      } else if (fs.existsSync(this.credentialsPath)) {
        // Load from file (local development)
        console.log('📧 Loading Gmail credentials from file');
        credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
      } else {
        console.log('⚠️ Gmail credentials not found. Please add GMAIL_CREDENTIALS environment variable or gmail-credentials.json file');
        return;
      }

      const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;

      this.oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Load existing token if available
      if (fs.existsSync(this.tokenPath)) {
        const token = JSON.parse(fs.readFileSync(this.tokenPath));
        this.oauth2Client.setCredentials(token);
        await this.setupGmailAPI();
      }

      console.log('📧 Gmail service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gmail service:', error.message);
    }
  }

  async setupGmailAPI() {
    try {
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Test the connection and get user info
      const profile = await this.gmail.users.getProfile({ userId: 'me' });
      this.userEmail = profile.data.emailAddress;
      this.isAuthenticated = true;

      // Setup nodemailer transporter with proper OAuth2
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: this.userEmail,
          clientId: this.oauth2Client._clientId,
          clientSecret: this.oauth2Client._clientSecret,
          refreshToken: this.oauth2Client.credentials.refresh_token,
          accessToken: this.oauth2Client.credentials.access_token
        }
      });

      console.log(`✅ Gmail connected: ${this.userEmail}`);
    } catch (error) {
      console.error('❌ Failed to setup Gmail API:', error.message);
      this.isAuthenticated = false;
    }
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async authenticate(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Save token for future use
      const configDir = path.dirname(this.tokenPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens));

      await this.setupGmailAPI();
      return { success: true, email: this.userEmail };
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.isAuthenticated) {
      throw new Error('Gmail not authenticated');
    }

    try {
      // Create email in RFC 2822 format
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: ${this.userEmail}`,
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlContent
      ];
      const message = messageParts.join('\n');

      // Encode message in base64url
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send via Gmail API
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log(`✅ Email sent to: ${to}`);
      
      return {
        success: true,
        messageId: result.data.id,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  }

  async sendBulkEmails(recipients, subject, htmlContent, textContent = null) {
    if (!this.isAuthenticated) {
      throw new Error('Gmail not authenticated');
    }

    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient.email, subject, htmlContent, textContent);
        results.push({
          recipient: recipient.name || recipient.email,
          email: recipient.email,
          status: 'sent',
          success: true,
          messageId: result.messageId
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          recipient: recipient.name || recipient.email,
          email: recipient.email,
          status: 'failed',
          error: error.message,
          success: false
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      message: `Emails sent to ${successCount}/${recipients.length} recipients`,
      results
    };
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  createEmailTemplate(type, data) {
    const templates = {
      attendance: {
        subject: '🎓 Daily Attendance Reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎓 Good Morning!</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af;">📅 Daily Attendance Reminder</h3>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
              <p>Please reply to this email with:</p>
              <ul>
                <li><strong>✅ "Present"</strong> - if you're attending today</li>
                <li><strong>❌ "Absent"</strong> - if you can't attend</li>
                <li><strong>⏰ "Late"</strong> - if you'll be late</li>
              </ul>
              <p style="color: #dc2626;"><strong>Reply within 2 hours to avoid follow-up messages.</strong></p>
            </div>
            <p>Have a great day! 📚</p>
          </div>
        `
      },
      followUp: {
        subject: '⏰ Attendance Follow-up Reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⏰ Attendance Follow-up Reminder</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p>You haven't marked your attendance yet for today.</p>
              <p><strong>Please reply immediately with:</strong></p>
              <ul>
                <li>✅ "Present"</li>
                <li>❌ "Absent"</li>
                <li>⏰ "Late"</li>
              </ul>
              <p style="color: #dc2626;"><strong>This is your final reminder. 📢</strong></p>
            </div>
          </div>
        `
      },
      weeklyReport: {
        subject: '📊 Weekly Attendance Summary',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">📊 Weekly Attendance Summary</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>👤 Student:</strong> ${data.studentName}</p>
              <p><strong>📅 Week:</strong> ${data.weekStart} - ${data.weekEnd}</p>
              <h3 style="color: #1e40af;">📈 Attendance Statistics:</h3>
              <ul>
                <li><strong>✅ Present:</strong> ${data.presentDays} days</li>
                <li><strong>⏰ Late:</strong> ${data.lateDays} days</li>
                <li><strong>❌ Absent:</strong> ${data.absentDays} days</li>
                <li><strong>📊 Percentage:</strong> ${data.percentage}%</li>
              </ul>
              <div style="padding: 15px; border-radius: 5px; margin: 15px 0; ${data.percentage >= 80 ? 'background: #dcfce7; color: #166534;' : data.percentage >= 60 ? 'background: #fef3c7; color: #92400e;' : 'background: #fef2f2; color: #dc2626;'}">
                ${data.percentage >= 80 ? '🎉 Great attendance! Keep it up!' : 
                  data.percentage >= 60 ? '⚠️ Attendance needs improvement' : 
                  '🚨 Poor attendance - please improve'}
              </div>
            </div>
            <p>Have a great week ahead! 📚</p>
          </div>
        `
      },
      project: {
        subject: `📢 New Project Assignment: ${data.projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">📢 New Project Assignment</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af;">${data.projectTitle}</h3>
              <p><strong>📝 Description:</strong> ${data.description}</p>
              <p><strong>⏰ Deadline:</strong> ${data.deadline}</p>
              <p><strong>📋 Requirements:</strong> ${data.requirements}</p>
            </div>
            <div style="background: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Please reply to this email with:</strong></p>
              <ul>
                <li><strong>"Accept"</strong> - if you want to take this project</li>
                <li><strong>"Decline"</strong> - if you cannot take this project</li>
                <li><strong>"Skip"</strong> - if you want to skip this time</li>
              </ul>
            </div>
            <p>Thank you! 🎓</p>
          </div>
        `
      },
      broadcast: {
        subject: data.subject || '📢 Important Announcement',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">📢 Announcement</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${data.message}
            </div>
            <p>Thank you! 🎓</p>
          </div>
        `
      }
    };

    return templates[type] || templates.broadcast;
  }

  isConnected() {
    return this.isAuthenticated;
  }

  getUserInfo() {
    if (!this.isAuthenticated) return null;
    return {
      email: this.userEmail,
      name: this.userEmail.split('@')[0]
    };
  }

  async disconnect() {
    try {
      if (fs.existsSync(this.tokenPath)) {
        fs.unlinkSync(this.tokenPath);
      }
      this.isAuthenticated = false;
      this.userEmail = null;
      this.gmail = null;
      this.transporter = null;
      console.log('📧 Gmail disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Gmail:', error.message);
    }
  }

  getStatus() {
    return {
      status: this.isAuthenticated ? 'connected' : 'disconnected',
      isReady: this.isAuthenticated,
      userEmail: this.userEmail,
      authUrl: this.isAuthenticated ? null : this.getAuthUrl()
    };
  }
}

// Create singleton instance
const gmailService = new GmailService();

export default gmailService;
