// Real email service using multiple providers
export const sendRealEmail = async (to, subject, htmlContent) => {
  // Method 1: Using Web3Forms (Free service)
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: 'YOUR_WEB3FORMS_KEY', // Get free key from web3forms.com
        to_email: to,
        subject: subject,
        message: htmlContent,
        from_name: 'Jewelry Shop Management'
      })
    })
    
    if (response.ok) {
      return { success: true, service: 'Web3Forms' }
    }
  } catch (error) {
    console.log('Web3Forms failed:', error)
  }

  // Method 2: Using Resend API (Free tier available)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_RESEND_API_KEY', // Get from resend.com
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to: [to],
        subject: subject,
        html: htmlContent
      })
    })
    
    if (response.ok) {
      return { success: true, service: 'Resend' }
    }
  } catch (error) {
    console.log('Resend failed:', error)
  }

  // Method 3: Using SMTP2GO API (Free tier)
  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': 'YOUR_SMTP2GO_KEY' // Get from smtp2go.com
      },
      body: JSON.stringify({
        to: [to],
        sender: 'noreply@yourdomain.com',
        subject: subject,
        html_body: htmlContent
      })
    })
    
    if (response.ok) {
      return { success: true, service: 'SMTP2GO' }
    }
  } catch (error) {
    console.log('SMTP2GO failed:', error)
  }

  return { success: false, service: 'none' }
}