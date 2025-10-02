'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import './globals.css'
import ModernNotification from './components/ModernNotification'

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const pathname = usePathname()
  
  // Determine if current page is gold or silver related
  const isSilverSection = pathname.includes('silver') || 
                         pathname.includes('/new-order-silver') ||
                         pathname.includes('/existing-orders-silver') ||
                         pathname.includes('/deposited-silver')
  
  const isGoldSection = !isSilverSection && (
                       pathname.includes('gold') || 
                       pathname.includes('/new-order') || 
                       pathname.includes('/existing-orders') ||
                       pathname.includes('/deposited-gold')
                      )

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileMenu])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <html lang="en">
      <body>
        {user && pathname !== '/admin' && (
          <nav className="navbar">
            <div className="nav-container">
              <div className="nav-title">
                <a href="/" style={{color: 'white', textDecoration: 'none'}}>💎 Jewel Shop</a>
              </div>
              <div className="nav-links">
                {pathname !== '/' && (
                  <>
                    <a href="/" className="nav-link">Home</a>
                    
                    {isGoldSection && (
                      <>
                        <a href="/new-order" className="nav-link">New Order (Gold)</a>
                        <a href="/existing-orders" className="nav-link">Orders (Gold)</a>
                        <a href="/gold-loan" className="nav-link">Gold Loan</a>
                        <a href="/deposited-gold" className="nav-link">Deposited Gold</a>
                      </>
                    )}
                    
                    {isSilverSection && (
                      <>
                        <a href="/new-order-silver" className="nav-link">New Order (Silver)</a>
                        <a href="/existing-orders-silver" className="nav-link">Orders (Silver)</a>
                        <a href="/silver-loan" className="nav-link">Silver Loan</a>
                        <a href="/deposited-silver" className="nav-link">Deposited Silver</a>
                      </>
                    )}
                    
                    {!isGoldSection && !isSilverSection && (
                      <>
                        <a href="/new-order" className="nav-link">New Order</a>
                        <a href="/existing-orders" className="nav-link">Orders</a>
                        <a href="/gold-loan" className="nav-link">Gold Loan</a>
                        <a href="/deposited-gold" className="nav-link">Deposited Gold</a>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="user-menu">
                <span>Welcome, {user.name}</span>
                <div className="profile-menu-container" style={{position: 'relative'}}>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ⋮
                  </button>
                  
                  {showProfileMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      overflow: 'hidden',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <div style={{fontWeight: 'bold', color: '#333'}}>{user.name}</div>
                        <div style={{fontSize: '0.9rem', color: '#666'}}>{user.email}</div>
                      </div>
                      
                      <div style={{padding: '0.5rem 0'}}>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            window.location.href = '/profile'
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#333',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          👤 View Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            window.location.href = '/settings'
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#333',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          ⚙️ Settings
                        </button>
                        
                        <div style={{height: '1px', backgroundColor: '#eee', margin: '0.5rem 0'}} />
                        
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            handleLogout()
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#dc3545',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#fff5f5'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}
        <div className={pathname === '/admin' ? '' : 'main-content'}>
          {children}
        </div>
        <ModernNotification />
      </body>
    </html>
  )
}