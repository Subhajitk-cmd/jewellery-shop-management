export async function sendEmail(to, subject, text) {
  // Simple email simulation - in production, use services like SendGrid, Nodemailer, etc.
  console.log(`Email would be sent to: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Message: ${text}`)
  
  // Simulate email sending failure for fallback testing
  // In production, replace with actual email service
  throw new Error('Email service not configured')
}