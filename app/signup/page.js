'use client'
import { useState } from 'react'
import axios from 'axios'
import { showNotification } from '../components/ModernNotification'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otp, setOtp] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error')
      return
    }
    
    if (!/^\d{10}$/.test(formData.phone)) {
      showNotification('Phone number must be exactly 10 digits', 'error')
      return
    }
    
    // Password validation
    if (formData.password.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error')
      return
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      showNotification('Password must contain at least one uppercase letter', 'error')
      return
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      showNotification('Password must contain at least one special character', 'error')
      return
    }
    
    try {
      const response = await axios.post('/api/auth/send-otp', formData)
      showNotification(response.data.message, 'success')
      
      // Show OTP in alert only if email service failed
      if (response.data.otp && response.data.message.includes('temporarily unavailable')) {
        setTimeout(() => {
          alert(`Email service is down. Your OTP is: ${response.data.otp}\n\nPlease use this OTP to continue.`)
        }, 1000)
      }
      
      setUserEmail(response.data.email)
      setShowOtpForm(true)
    } catch (error) {
      showNotification(error.response?.data?.error || 'An error occurred', 'error')
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp) {
      showNotification('Please enter OTP', 'error')
      return
    }
    
    if (otp.length !== 6) {
      showNotification('OTP must be exactly 6 digits', 'error')
      return
    }
    
    if (!/^\d{6}$/.test(otp)) {
      showNotification('OTP must contain only numbers', 'error')
      return
    }
    
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email: userEmail,
        otp
      })
      showNotification(response.data.message, 'success')
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } catch (error) {
      showNotification(error.response?.data?.error || 'Invalid OTP', 'error')
    }
  }

  if (showOtpForm) {
    return (
      <div className="form-container">
        <h2>Email Verification</h2>
        <p style={{textAlign: 'center', marginBottom: '1.5rem', color: '#666'}}>
          We've sent a 6-digit OTP to <strong>{userEmail}</strong>
        </p>
        <form onSubmit={handleOtpSubmit}>
          <div className="form-group">
            <label>Enter OTP *</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Only allow digits
                setOtp(value)
              }}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              pattern="[0-9]{6}"
              required
              style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                letterSpacing: '0.2rem'
              }}
            />
          </div>
          <button type="submit" className="btn">Verify OTP</button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => setShowOtpForm(false)}
            style={{marginTop: '0.5rem', backgroundColor: '#6c757d'}}
          >
            Back to Sign Up
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            maxLength="10"
            pattern="[0-9]{10}"
            title="Please enter exactly 10 digits"
            required
          />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 8 chars, 1 uppercase, 1 special char"
            required
          />
          <small style={{color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem'}}>
            Password must be at least 8 characters with 1 uppercase letter and 1 special character
          </small>
        </div>
        <button type="submit" className="btn">Send OTP</button>
      </form>
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  )
}