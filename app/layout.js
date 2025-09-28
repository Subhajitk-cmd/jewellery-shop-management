'use client'
import { useState, useEffect } from 'react'
import './globals.css'

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <html lang="en">
      <body>
        <nav style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => window.history.back()} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}>←</button>
              <h1 style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: 0,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }} onClick={() => window.location.href = '/'}>💎 JEWEL SHOP</h1>
            </div>
            <div>
              {user ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  position: 'relative'
                }}>
                  <span style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '300'
                  }}>Hi, <span style={{fontWeight: 'bold', color: '#FFD700'}}>{user.name}</span></span>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowMenu(!showMenu)} style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>⋮</button>
                    {showMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        minWidth: '150px',
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}>
                        <button onClick={() => { setShowMenu(false); window.location.href = '/' }} style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#333',
                          transition: 'background 0.2s'
                        }} onMouseOver={(e) => e.target.style.background = '#f5f5f5'} onMouseOut={(e) => e.target.style.background = 'transparent'}>🏠 Dashboard</button>
                        <button onClick={() => { setShowMenu(false); logout() }} style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#e74c3c',
                          transition: 'background 0.2s'
                        }} onMouseOver={(e) => e.target.style.background = '#f5f5f5'} onMouseOut={(e) => e.target.style.background = 'transparent'}>🚪 Logout</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <a href="/login" style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '25px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}>Login</a>
                  <a href="/signup" style={{
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    color: 'black',
                    textDecoration: 'none',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    transition: 'all 0.3s ease'
                  }}>Sign Up</a>
                </div>
              )}
            </div>
          </div>
        </nav>
        <main className="main-content" onClick={() => setShowMenu(false)}>
          {children}
        </main>

      </body>
    </html>
  )
}