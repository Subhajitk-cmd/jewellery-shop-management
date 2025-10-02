'use client'
import { useState } from 'react'
import axios from 'axios'
import { showNotification } from '../components/ModernNotification'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      showNotification('Login successful! Redirecting...', 'success')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      showNotification(error.response?.data?.error || 'An error occurred', 'error')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/forgot-password', { email: resetEmail })
      showNotification(response.data.message, 'success')
      
      // Show OTP if email service is unavailable
      if (response.data.otp) {
        setTimeout(() => {
          alert(`Email service is down. Your OTP is: ${response.data.otp}\n\nPlease use this OTP to reset your password.`)
        }, 1000)
      }
      
      setShowResetForm(true)
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error sending reset email', 'error')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return
    }
    
    if (newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error')
      return
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      showNotification('Password must contain at least one uppercase letter', 'error')
      return
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showNotification('Password must contain at least one special character', 'error')
      return
    }
    
    try {
      const response = await axios.post('/api/auth/reset-password', {
        email: resetEmail,
        otp,
        newPassword
      })
      showNotification(response.data.message, 'success')
      setShowForgotPassword(false)
      setShowResetForm(false)
      setResetEmail('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error resetting password', 'error')
    }
  }

  if (showForgotPassword) {
    if (showResetForm) {
      return (
        <div className="form-container">
          <h2>Reset Password</h2>
          <p style={{textAlign: 'center', marginBottom: '1.5rem', color: '#666'}}>
            Enter the OTP sent to <strong>{resetEmail}</strong> and your new password
          </p>
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>OTP *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label>New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 special char"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
            </div>
            <button type="submit" className="btn">Reset Password</button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => setShowForgotPassword(false)}
              style={{marginTop: '0.5rem', backgroundColor: '#6c757d'}}
            >
              Back to Login
            </button>
          </form>
        </div>
      )
    }
    
    return (
      <div className="form-container">
        <h2>Forgot Password</h2>
        <p style={{textAlign: 'center', marginBottom: '1.5rem', color: '#666'}}>
          Enter your email address and we'll send you an OTP to reset your password
        </p>
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
          </div>
          <button type="submit" className="btn">Send OTP</button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => setShowForgotPassword(false)}
            style={{marginTop: '0.5rem', backgroundColor: '#6c757d'}}
          >
            Back to Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
      <div style={{textAlign: 'center', marginTop: '1rem'}}>
        <button 
          type="button" 
          onClick={() => setShowForgotPassword(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Forgot Password?
        </button>
      </div>
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  )
}