'use client'
import { useState, useEffect } from 'react'
import { showToast } from '../utils/toast'

export default function Footer() {
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    address: '123 Jewelry Street, Gold District',
    phone: '+91 98765 43210',
    email: 'info@jewelshop.com',
    hours: 'Mon-Sat: 10AM-8PM'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    // Load saved contact info from localStorage
    const saved = localStorage.getItem('contactInfo')
    if (saved) {
      setContactInfo(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo))
    setEditMode(false)
    showToast('Contact information updated successfully!', 'success')
  }
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
      color: 'white',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>💎 JEWEL SHOP</h3>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.6',
              fontSize: '0.95rem'
            }}>
              Your trusted partner for exquisite jewelry and reliable gold loan services. 
              Quality craftsmanship meets exceptional service.
            </p>
          </div>
          
          <div>
            <h4 style={{
              color: '#FFD700',
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>{user ? 'Quick Actions' : 'Services'}</h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {user ? [
                { name: 'New Gold Order', link: '/new-order' },
                { name: 'New Silver Order', link: '/new-order-silver' },
                { name: 'Gold Loan', link: '/gold-loan' },
                { name: 'View Orders', link: '/existing-orders' }
              ].map(item => (
                <li key={item.name} style={{
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#FFD700'}
                   onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                   onClick={() => window.location.href = item.link}>
                  • {item.name}
                </li>
              )) : ['Custom Jewelry Orders', 'Gold Loan Services', 'Silver Collections', 'Jewelry Repairs'].map(service => (
                <li key={service} style={{
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }} onMouseOver={(e) => e.target.style.color = '#FFD700'}
                   onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                  • {service}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <h4 style={{
                color: '#FFD700',
                fontSize: '1.1rem',
                margin: 0
              }}>Contact Info</h4>
              {user && (
                <button onClick={() => editMode ? handleSave() : setEditMode(true)} style={{
                  background: 'rgba(255,215,0,0.2)',
                  border: '1px solid #FFD700',
                  color: '#FFD700',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  {editMode ? '✓ Save' : '✎ Edit'}
                </button>
              )}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.9rem',
              lineHeight: '1.8'
            }}>
              {editMode ? (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span>📍 </span>
                    <input value={contactInfo.address} onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})} style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.25rem',
                      borderRadius: '3px',
                      fontSize: '0.9rem',
                      width: '200px'
                    }} />
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span>📞 </span>
                    <input value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.25rem',
                      borderRadius: '3px',
                      fontSize: '0.9rem',
                      width: '150px'
                    }} />
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span>✉️ </span>
                    <input value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.25rem',
                      borderRadius: '3px',
                      fontSize: '0.9rem',
                      width: '180px'
                    }} />
                  </div>
                  <div>
                    <span>🕒 </span>
                    <input value={contactInfo.hours} onChange={(e) => setContactInfo({...contactInfo, hours: e.target.value})} style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.25rem',
                      borderRadius: '3px',
                      fontSize: '0.9rem',
                      width: '160px'
                    }} />
                  </div>
                </>
              ) : (
                <>
                  <p>📍 {contactInfo.address}</p>
                  <p>📞 {contactInfo.phone}</p>
                  <p>✉️ {contactInfo.email}</p>
                  <p>🕒 {contactInfo.hours}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85rem',
            margin: 0
          }}>
            © 2024 Jewel Shop. All rights reserved. {user && `Welcome, ${user.name}!`}
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            {user ? [
              { name: 'Dashboard', link: '/' },
              { name: 'My Orders', link: '/existing-orders' },
              { name: 'Support', link: '#' }
            ].map(link => (
              <a key={link.name} href={link.link} style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'color 0.3s ease'
              }} onMouseOver={(e) => e.target.style.color = '#FFD700'}
                 onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                {link.name}
              </a>
            )) : ['Privacy Policy', 'Terms of Service', 'Support'].map(link => (
              <a key={link} href="#" style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'color 0.3s ease'
              }} onMouseOver={(e) => e.target.style.color = '#FFD700'}
                 onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}