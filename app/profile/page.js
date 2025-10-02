'use client'
import { useState, useEffect } from 'react'

export default function Profile() {
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
      <h2>User Profile</h2>
      
      <div style={{
        display: 'grid',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <label style={{fontWeight: 'bold', color: '#495057'}}>Name:</label>
          <p style={{margin: '0.5rem 0 0 0', fontSize: '1.1rem'}}>{user.name}</p>
        </div>
        
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <label style={{fontWeight: 'bold', color: '#495057'}}>Email:</label>
          <p style={{margin: '0.5rem 0 0 0', fontSize: '1.1rem'}}>{user.email}</p>
        </div>
        
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <label style={{fontWeight: 'bold', color: '#495057'}}>Phone:</label>
          <p style={{margin: '0.5rem 0 0 0', fontSize: '1.1rem'}}>{user.phone || 'Not provided'}</p>
        </div>
        
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <label style={{fontWeight: 'bold', color: '#495057'}}>User ID:</label>
          <p style={{margin: '0.5rem 0 0 0', fontSize: '0.9rem', fontFamily: 'monospace', color: '#6c757d'}}>{user.id}</p>
        </div>
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