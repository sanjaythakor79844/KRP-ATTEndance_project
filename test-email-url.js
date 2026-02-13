// Quick test to verify email template URLs
const emailTemplates = require('./server/templates/emailTemplates.js');

// Set environment variables for testing
process.env.BACKEND_URL = 'https://krp-attendance-project.onrender.com';
process.env.FRONTEND_URL = 'https://krp-att-endance-project.vercel.app';

// Test data
const testData = {
  studentName: 'Test Student',
  studentId: 'test123',
  projectId: 'proj123',
  projectTitle: 'Test Project',
  description: 'Test description',
  deadline: new Date().toISOString(),
  location: 'Test Location',
  requirements: 'Test requirements'
};

// Generate email HTML
const html = emailTemplates.projectAssignment(testData);

// Extract URLs from HTML
const acceptUrlMatch = html.match(/href="([^"]*\/api\/projects\/respond[^"]*)"/);
const declineUrlMatch = html.match(/href="([^"]*\/api\/projects\/respond[^"]*)"/g);

console.log('\n🔍 Email Template URL Test\n');
console.log('Environment Variables:');
console.log('  BACKEND_URL:', process.env.BACKEND_URL);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('\nGenerated URLs in Email:');

if (acceptUrlMatch) {
  console.log('  Accept URL:', acceptUrlMatch[1]);
}

if (declineUrlMatch && declineUrlMatch.length > 1) {
  const declineUrl = declineUrlMatch[1].match(/href="([^"]*)"/)[1];
  console.log('  Decline URL:', declineUrl);
}

// Check if localhost is present
if (html.includes('localhost:5000')) {
  console.log('\n❌ ERROR: localhost:5000 found in email!');
} else {
  console.log('\n✅ SUCCESS: No localhost URLs found!');
}

console.log('\n');
