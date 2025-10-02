// Simple email service using EmailJS or similar service
export const sendOTPEmail = async (email, name, otp) => {
  try {
    // Using a mock email service - replace with your preferred email service
    const response = await fetch('https://formspree.io/f/your-form-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subject: 'Jewelry Shop - Email Verification OTP',
        message: `Hello ${name},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nThank you!`
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Email service error:', error)
    return false
  }
}

// Alternative: Console-based email for development
export const sendOTPConsole = (email, name, otp) => {
  console.log(`
    ===== EMAIL SENT =====
    To: ${email}
    Subject: Jewelry Shop - Email Verification OTP
    
    Hello ${name},
    
    Your OTP for email verification is: ${otp}
    
    This OTP will expire in 10 minutes.
    
    Thank you!
    ======================
  `)
}