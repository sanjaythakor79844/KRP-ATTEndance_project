// Professional email templates for all functionalities

const brandColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  dark: '#1f2937',
  light: '#f3f4f6'
};

const emailHeader = (title, color = brandColors.primary) => `
  <div style="background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
      🎓 KRP Academy
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
      ${title}
    </p>
  </div>
`;

const emailFooter = () => `
  <div style="background: ${brandColors.light}; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 30px;">
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
      This is an automated message from KRP Academy Dashboard
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      © ${new Date().getFullYear()} KRP Academy. All rights reserved.
    </p>
  </div>
`;

const button = (text, url, color = brandColors.primary) => `
  <a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
    ${text}
  </a>
`;

function adjustColor(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// 1. PROJECT ASSIGNMENT EMAIL
export const projectAssignmentTemplate = (data) => {
  const { studentName, studentId, projectId, projectTitle, description, deadline, location, requirements, dashboardUrl = 'http://localhost:5173', serverUrl = process.env.BACKEND_URL || 'https://krp-attendance-project.onrender.com' } = data;
  
  // Create response URLs
  const acceptUrl = `${serverUrl}/api/projects/respond?projectId=${projectId}&studentId=${studentId}&response=accept`;
  const declineUrl = `${serverUrl}/api/projects/respond?projectId=${projectId}&studentId=${studentId}&response=decline`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Project Assignment</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader('New Project Assignment', brandColors.primary)}
        
        <div style="padding: 30px;">
          <h2 style="color: ${brandColors.dark}; margin-top: 0;">
            Hello ${studentName}! 👋
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            You have been assigned to an exciting new project. We believe you'll do great!
          </p>
          
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${brandColors.primary};">
            <h3 style="color: ${brandColors.primary}; margin-top: 0; font-size: 20px;">
              📊 ${projectTitle}
            </h3>
            <p style="color: #1e40af; margin: 15px 0; line-height: 1.6;">
              ${description}
            </p>
            <div style="margin-top: 20px;">
              <p style="margin: 8px 0; color: #1e3a8a;">
                <strong>📅 Deadline:</strong> ${new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style="margin: 8px 0; color: #1e3a8a;">
                <strong>📍 Location:</strong> ${location}
              </p>
            </div>
          </div>
          
          ${requirements ? `
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${brandColors.success};">
            <h4 style="color: #065f46; margin-top: 0;">📋 Project Requirements:</h4>
            <p style="color: #047857; margin: 10px 0; line-height: 1.8; white-space: pre-wrap;">
              ${requirements}
            </p>
          </div>
          ` : ''}
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${brandColors.warning};">
            <h4 style="color: #92400e; margin-top: 0;">⚡ Please Respond:</h4>
            <p style="color: #78350f; margin: 10px 0; line-height: 1.8;">
              Click one of the buttons below to confirm your availability for this project.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="padding: 0 10px;">
                  <a href="${acceptUrl}" style="display: inline-block; background: ${brandColors.success}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    ✅ Accept Project
                  </a>
                </td>
                <td style="padding: 0 10px;">
                  <a href="${declineUrl}" style="display: inline-block; background: ${brandColors.danger}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    ❌ Decline Project
                  </a>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${dashboardUrl}" style="color: ${brandColors.primary}; text-decoration: none; font-size: 14px;">
              Or view in dashboard →
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Good luck with your project! 🚀
          </p>
        </div>
        
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 2. ATTENDANCE WARNING EMAIL (< 80%)
export const attendanceWarningTemplate = (data) => {
  const { studentName, studentId, percentage, totalDays, presentDays, absentDays, lateDays, dashboardUrl = 'http://localhost:5173' } = data;
  
  // Create student-specific attendance report URL
  const reportUrl = `${dashboardUrl}?tab=attendance&student=${studentId}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Attendance Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader('Attendance Alert', brandColors.danger)}
        
        <div style="padding: 30px;">
          <h2 style="color: ${brandColors.dark}; margin-top: 0;">
            Dear ${studentName},
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We've noticed that your attendance has dropped below the required threshold. Let's work together to improve it!
          </p>
          
          <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 30px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid ${brandColors.danger};">
            <p style="color: #991b1b; font-size: 16px; margin: 0 0 10px 0;">
              Your Current Attendance
            </p>
            <p style="color: ${brandColors.danger}; font-size: 48px; font-weight: bold; margin: 10px 0;">
              ${percentage}%
            </p>
            <p style="color: #991b1b; font-size: 14px; margin: 10px 0 0 0;">
              ⚠️ Below 80% Required Threshold
            </p>
          </div>
          
          <div style="background: ${brandColors.light}; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: ${brandColors.dark}; margin-top: 0; font-size: 18px;">
              📊 Attendance Breakdown
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 20px;">📅</span> Total Days
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.dark}; border-bottom: 1px solid #e5e7eb;">
                  ${totalDays}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 20px;">✅</span> Present
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.success}; border-bottom: 1px solid #e5e7eb;">
                  ${presentDays}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 20px;">❌</span> Absent
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.danger}; border-bottom: 1px solid #e5e7eb;">
                  ${absentDays}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4b5563;">
                  <span style="font-size: 20px;">⏰</span> Late
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.warning};">
                  ${lateDays}
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${brandColors.warning};">
            <h4 style="color: #92400e; margin-top: 0;">⚡ Action Required:</h4>
            <ul style="color: #78350f; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>Attend all upcoming classes regularly</li>
              <li>Aim to improve attendance to at least 80%</li>
              <li>Contact admin if you have valid reasons for absences</li>
              <li>Set reminders to avoid missing classes</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            ${button('View Full Attendance Report', reportUrl, brandColors.danger)}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            We're here to support you! 💪
          </p>
        </div>
        
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 3. ATTENDANCE CONGRATULATIONS EMAIL (≥ 80%)
export const attendanceCongratulationsTemplate = (data) => {
  const { studentName, studentId, percentage, totalDays, presentDays, absentDays, lateDays, dashboardUrl = 'http://localhost:5173' } = data;
  
  // Create student-specific attendance report URL
  const reportUrl = `${dashboardUrl}?tab=attendance&student=${studentId}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0;">
      <title>Excellent Attendance!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader('Excellent Attendance!', brandColors.success)}
        
        <div style="padding: 30px;">
          <h2 style="color: ${brandColors.dark}; margin-top: 0;">
            Congratulations ${studentName}! 🎉
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your dedication and consistency are truly commendable. Keep up the excellent work!
          </p>
          
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 30px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid ${brandColors.success};">
            <p style="color: #065f46; font-size: 16px; margin: 0 0 10px 0;">
              Your Outstanding Attendance
            </p>
            <p style="color: ${brandColors.success}; font-size: 48px; font-weight: bold; margin: 10px 0;">
              ${percentage}%
            </p>
            <p style="color: #065f46; font-size: 14px; margin: 10px 0 0 0;">
              ✨ Excellent Performance!
            </p>
          </div>
          
          <div style="background: ${brandColors.light}; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: ${brandColors.dark}; margin-top: 0; font-size: 18px;">
              📊 Your Attendance Record
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 20px;">📅</span> Total Days
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.dark}; border-bottom: 1px solid #e5e7eb;">
                  ${totalDays}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 20px;">✅</span> Present
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.success}; border-bottom: 1px solid #e5e7eb;">
                  ${presentDays}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 20px;">❌</span> Absent
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.danger}; border-bottom: 1px solid #e5e7eb;">
                  ${absentDays}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #4b5563;">
                  <span style="font-size: 20px;">⏰</span> Late
                </td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColors.warning};">
                  ${lateDays}
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${brandColors.primary};">
            <h4 style="color: #1e40af; margin-top: 0;">🌟 Keep It Up!</h4>
            <p style="color: #1e3a8a; margin: 10px 0; line-height: 1.8;">
              Your consistent attendance shows your commitment to learning. Continue maintaining this excellent record, and you'll achieve great success!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            ${button('View Full Report', reportUrl, brandColors.success)}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            You're doing amazing! Keep shining! ⭐
          </p>
        </div>
        
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 4. ATTENDANCE MANAGER REMINDER
export const attendanceManagerReminderTemplate = (data) => {
  const { managerName, managerId, date, students, dashboardUrl = 'http://localhost:5173', serverUrl = process.env.BACKEND_URL || 'https://krp-attendance-project.onrender.com' } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Attendance Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 700px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader('Attendance Reminder', brandColors.warning)}
        
        <div style="padding: 30px;">
          <h2 style="color: ${brandColors.dark}; margin-top: 0;">
            Hello ${managerName}! 👋
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder to mark today's attendance for all students.
          </p>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid ${brandColors.warning};">
            <h3 style="color: #92400e; margin-top: 0;">
              📅 ${date}
            </h3>
            <p style="color: #78350f; margin: 10px 0;">
              <strong>Quick Action:</strong> Click buttons below to mark attendance directly from email!
            </p>
          </div>
          
          ${students && students.length > 0 ? `
          <div style="background: ${brandColors.light}; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h4 style="color: ${brandColors.dark}; margin-top: 0;">👥 Mark Attendance (${students.length} students):</h4>
            <div style="margin-top: 15px;">
              ${students.map(s => `
                <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="margin-bottom: 10px;">
                    <strong style="color: ${brandColors.dark}; font-size: 15px;">${s.name}</strong>
                    <span style="color: #6b7280; font-size: 13px; margin-left: 10px;">${s.email}</span>
                  </div>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-right: 8px;">
                        <a href="${serverUrl}/api/attendance/mark-email?studentId=${s.id}&status=present&managerId=${managerId}&date=${new Date().toISOString().split('T')[0]}" 
                           style="display: inline-block; background: ${brandColors.success}; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
                          ✅ Present
                        </a>
                      </td>
                      <td style="padding-right: 8px;">
                        <a href="${serverUrl}/api/attendance/mark-email?studentId=${s.id}&status=absent&managerId=${managerId}&date=${new Date().toISOString().split('T')[0]}" 
                           style="display: inline-block; background: ${brandColors.danger}; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
                          ❌ Absent
                        </a>
                      </td>
                      <td>
                        <a href="${serverUrl}/api/attendance/mark-email?studentId=${s.id}&status=late&managerId=${managerId}&date=${new Date().toISOString().split('T')[0]}" 
                           style="display: inline-block; background: ${brandColors.warning}; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
                          ⏰ Late
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 25px 0; border: 2px solid #e5e7eb;">
            <h4 style="color: ${brandColors.dark}; margin-top: 0;">💡 Or use the dashboard:</h4>
            <ol style="color: #4b5563; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>Open the dashboard using the button below</li>
              <li>Navigate to the <strong>Attendance</strong> tab</li>
              <li>Mark each student as Present, Absent, or Late</li>
              <li>Click <strong>Refresh</strong> to see updated summary</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            ${button('Open Dashboard', dashboardUrl, brandColors.primary)}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for your cooperation! 🙏
          </p>
        </div>
        
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 5. PROJECT RESPONSE CONFIRMATION (Accept/Decline/Skip)
export const projectResponseTemplate = (data) => {
  const { studentName, projectTitle, response, dashboardUrl = 'http://localhost:5173' } = data;
  
  const responseConfig = {
    accept: {
      color: brandColors.success,
      icon: '✅',
      title: 'Project Accepted!',
      message: 'Thank you for accepting this project. We look forward to your contribution!'
    },
    decline: {
      color: brandColors.danger,
      icon: '❌',
      title: 'Project Declined',
      message: 'Thank you for your response. We\'ll assign this project to another student.'
    },
    skip: {
      color: brandColors.warning,
      icon: '⏭️',
      title: 'Project Skipped',
      message: 'No problem! You\'ll be considered for the next project opportunity.'
    }
  };
  
  const config = responseConfig[response] || responseConfig.skip;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Response Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader(config.title, config.color)}
        
        <div style="padding: 30px;">
          <h2 style="color: ${brandColors.dark}; margin-top: 0;">
            Hello ${studentName}! 👋
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ${config.message}
          </p>
          
          <div style="background: ${config.color}22; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border-left: 4px solid ${config.color};">
            <p style="font-size: 48px; margin: 0;">
              ${config.icon}
            </p>
            <h3 style="color: ${config.color}; margin: 15px 0 5px 0;">
              ${projectTitle}
            </h3>
            <p style="color: #4b5563; margin: 5px 0 0 0; text-transform: capitalize;">
              Response: <strong>${response}</strong>
            </p>
          </div>
          
          ${response === 'accept' ? `
          <div style="background: ${brandColors.light}; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: ${brandColors.dark}; margin-top: 0;">📋 Next Steps:</h4>
            <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li>Check your dashboard for project details</li>
              <li>Mark your calendar for the deadline</li>
              <li>Contact admin if you have questions</li>
              <li>Start preparing for the project</li>
            </ul>
          </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            ${response === 'accept' ? 'Good luck! 🚀' : 'Stay tuned for more opportunities! 📚'}
          </p>
        </div>
        
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 6. BROADCAST MESSAGE
export const broadcastMessageTemplate = (data) => {
  const { subject, message, dashboardUrl = 'http://localhost:5173' } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader(subject, brandColors.primary)}
        
        <div style="padding: 30px;">
          <div style="color: #4b5563; font-size: 16px; line-height: 1.8;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            ${button('Open Dashboard', dashboardUrl, brandColors.primary)}
          </div>
        </div>
        
        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

// 7. ATTENDANCE CONFIRMATION EMAIL (Sent to student when attendance is marked)
const attendanceConfirmationTemplate = (data) => {
  const { studentName, date, status, statusEmoji, statusColor } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Attendance Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        ${emailHeader('Attendance Confirmation', statusColor)}
        
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 80px; margin-bottom: 20px;">
              ${statusEmoji}
            </div>
            <h2 style="color: ${brandColors.dark}; margin: 0 0 10px 0; font-size: 24px;">
              Attendance Marked
            </h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">
              Your attendance has been recorded
            </p>
          </div>

          <div style="background: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: ${brandColors.dark}; font-size: 14px; font-weight: 600;">
              Student Name:
            </p>
            <p style="margin: 0 0 20px 0; color: ${brandColors.dark}; font-size: 18px; font-weight: bold;">
              ${studentName}
            </p>
            
            <p style="margin: 0 0 10px 0; color: ${brandColors.dark}; font-size: 14px; font-weight: 600;">
              Date:
            </p>
            <p style="margin: 0 0 20px 0; color: ${brandColors.dark}; font-size: 16px;">
              ${date}
            </p>
            
            <p style="margin: 0 0 10px 0; color: ${brandColors.dark}; font-size: 14px; font-weight: 600;">
              Status:
            </p>
            <p style="margin: 0; color: ${statusColor}; font-size: 20px; font-weight: bold;">
              ${statusEmoji} ${status}
            </p>
          </div>

          <div style="background: ${brandColors.light}; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              📊 <strong>Track Your Attendance:</strong>
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              You can view your complete attendance record and percentage on the dashboard.
            </p>
          </div>

          ${status === 'Absent' ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #991b1b; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              ⚠️ Important Notice
            </p>
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              Please ensure regular attendance. Maintaining good attendance is important for your academic progress.
            </p>
          </div>
          ` : ''}

          ${status === 'Present' ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #166534; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              ✅ Great Job!
            </p>
            <p style="color: #166534; font-size: 14px; margin: 0;">
              Keep up the excellent attendance record. Your dedication is appreciated!
            </p>
          </div>
          ` : ''}
        </div>

        ${emailFooter()}
      </div>
    </body>
    </html>
  `;
};

export default {
  projectAssignment: projectAssignmentTemplate,
  attendanceWarning: attendanceWarningTemplate,
  attendanceCongratulations: attendanceCongratulationsTemplate,
  attendanceManagerReminder: attendanceManagerReminderTemplate,
  projectResponse: projectResponseTemplate,
  broadcastMessage: broadcastMessageTemplate,
  attendanceConfirmation: attendanceConfirmationTemplate
};
