'use client'
import { useState, useEffect } from 'react'

export default function Settings() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      window.location.href = '/login'
    }
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <h2>Settings</h2>
      
      <div style={{
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{color: '#6c757d', marginBottom: '1rem'}}>Settings Coming Soon</h3>
        <p style={{color: '#6c757d'}}>
          Account settings and preferences will be available here in future updates.
        </p>
      </div>
      
      <div style={{textAlign: 'center'}}>
        <button 
          className="btn"
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}