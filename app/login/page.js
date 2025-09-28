'use client'
import { useState } from 'react'
import axios from 'axios'
import { showToast } from '../utils/toast'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

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
      showToast('Login successful! Redirecting...', 'success')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      showToast(error.response?.data?.error || 'An error occurred', 'error')
    }
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
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  )
}