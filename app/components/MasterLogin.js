'use client'
import { useState } from 'react'
import axios from 'axios'
import { showNotification, showConfirmDialog } from './ModernNotification'

export default function MasterLogin({ onMasterLogin }) {
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id
      if (!userId) {
        showNotification('Please login to your account first', 'warning')
        return
      }
      
      // Check user approval status first
      const statusResponse = await axios.get('/api/user/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (statusResponse.data.status !== 'approved') {
        showNotification('Please verify your account by admin before accessing master features', 'warning')
        return
      }
      
      const response = await axios.post('/api/master/auth', {
        action: 'login',
        password,
        userId
      })
      
      if (response.data.success) {
        setIsMasterLoggedIn(true)
        setShowLogin(false)
        setPassword('')
        onMasterLogin(true)
        
        if (response.data.isTemporary) {
          showNotification('Login successful! Please change your temporary password.', 'warning')
          setShowChangePassword(true)
        } else {
          showNotification('Master login successful! Delete options enabled.', 'success')
        }
      }
    } catch (error) {
      showNotification(error.response?.data?.error || 'Login failed', 'error')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsMasterLoggedIn(false)
    onMasterLogin(false)
    showNotification('Master logout successful! Delete options disabled.', 'info')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error')
      return
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id
      await axios.post('/api/master/auth', {
        action: 'changePassword',
        newPassword,
        userId
      })
      
      showNotification('Password changed successfully!', 'success')
      setShowChangePassword(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      showNotification('Error changing password', 'error')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      // Check user approval status first
      const statusResponse = await axios.get('/api/user/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (statusResponse.data.status !== 'approved') {
        showNotification('Please verify your account by admin before accessing master features', 'warning')
        return
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id
      const response = await axios.post('/api/master/auth', {
        action: 'forgotPassword',
        email,
        userId
      })
      
      showNotification(response.data.message, 'success')
      setResetOtp(response.data.otp) // For testing
      setShowForgotPassword(false)
      setShowResetForm(true)
    } catch (error) {
      showNotification('Error sending reset OTP', 'error')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id
      await axios.post('/api/master/auth', {
        action: 'resetPassword',
        otp,
        newPassword,
        userId
      })
      
      showNotification('Password reset successfully!', 'success')
      setShowResetForm(false)
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setEmail('')
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error resetting password', 'error')
    }
  }

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }

  const formStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    minWidth: '300px'
  }

  if (showLogin) {
    return (
      <div style={modalStyle}>
        <div style={formStyle}>
          <h3 style={{marginBottom: '1rem', textAlign: 'center'}}>Master Login</h3>
          <form onSubmit={handleLogin}>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Master Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
              <button type="submit" style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Login
              </button>
              <button type="button" onClick={() => setShowLogin(false)} style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
            <div style={{textAlign: 'center'}}>
              <button type="button" onClick={() => {setShowLogin(false); setShowForgotPassword(true)}} style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (showChangePassword) {
    return (
      <div style={modalStyle}>
        <div style={formStyle}>
          <h3 style={{marginBottom: '1rem', textAlign: 'center'}}>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button type="submit" style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Change Password
              </button>
              <button type="button" onClick={() => setShowChangePassword(false)} style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (showForgotPassword) {
    return (
      <div style={modalStyle}>
        <div style={formStyle}>
          <h3 style={{marginBottom: '1rem', textAlign: 'center'}}>Forgot Password</h3>
          <form onSubmit={handleForgotPassword}>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Your Registered Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your first signup email"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
              <small style={{color: '#666', fontSize: '0.8rem'}}>Use the email from your approved account</small>
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button type="submit" style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Send OTP
              </button>
              <button type="button" onClick={() => setShowForgotPassword(false)} style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (showResetForm) {
    return (
      <div style={modalStyle}>
        <div style={formStyle}>
          <h3 style={{marginBottom: '1rem', textAlign: 'center'}}>Reset Password</h3>
          <form onSubmit={handleResetPassword}>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Enter OTP:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem'}}>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button type="submit" style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Reset Password
              </button>
              <button type="button" onClick={() => setShowResetForm(false)} style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
      {!isMasterLoggedIn ? (
        <button
          onClick={() => setShowLogin(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Master Login
        </button>
      ) : (
        <>
          <span style={{color: '#28a745', fontWeight: 'bold', fontSize: '0.9rem'}}>
            🔓 Master Mode
          </span>
          <button
            onClick={() => setShowChangePassword(true)}
            style={{
              padding: '0.3rem 0.6rem',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginRight: '0.5rem'
            }}
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.3rem 0.6rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  )
}