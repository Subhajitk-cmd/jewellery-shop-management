'use client'
import { useState, useEffect } from 'react'

let notificationQueue = []
let setNotifications = null

export const showNotification = (message, type = 'info', duration = 4000) => {
  const id = Date.now() + Math.random()
  const notification = { id, message, type, duration }
  
  if (setNotifications) {
    setNotifications(prev => [...prev, notification])
  } else {
    notificationQueue.push(notification)
  }
}

export const showConfirmDialog = (message, onConfirm, onCancel) => {
  const id = Date.now() + Math.random()
  const notification = { 
    id, 
    message, 
    type: 'confirm', 
    onConfirm, 
    onCancel,
    duration: 0 // Don't auto-dismiss
  }
  
  if (setNotifications) {
    setNotifications(prev => [...prev, notification])
  } else {
    notificationQueue.push(notification)
  }
}

export default function ModernNotification() {
  const [notifications, setNotificationsState] = useState([])

  useEffect(() => {
    setNotifications = setNotificationsState
    
    // Process queued notifications
    if (notificationQueue.length > 0) {
      setNotificationsState(notificationQueue)
      notificationQueue = []
    }
  }, [])

  const removeNotification = (id) => {
    setNotificationsState(prev => prev.filter(n => n.id !== id))
  }

  const handleConfirm = (notification) => {
    if (notification.onConfirm) notification.onConfirm()
    removeNotification(notification.id)
  }

  const handleCancel = (notification) => {
    if (notification.onCancel) notification.onCancel()
    removeNotification(notification.id)
  }

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration)
        
        return () => clearTimeout(timer)
      }
    })
  }, [notifications])

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'confirm': return '❓'
      default: return 'ℹ️'
    }
  }

  const getColors = (type) => {
    switch (type) {
      case 'success': return { bg: '#d4edda', border: '#28a745', text: '#155724' }
      case 'error': return { bg: '#f8d7da', border: '#dc3545', text: '#721c24' }
      case 'warning': return { bg: '#fff3cd', border: '#ffc107', text: '#856404' }
      case 'confirm': return { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2' }
      default: return { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => {
        const colors = getColors(notification.type)
        
        return (
          <div
            key={notification.id}
            style={{
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              animation: 'slideIn 0.3s ease-out',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated border */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${colors.border}, transparent, ${colors.border})`,
              animation: notification.type === 'confirm' ? 'none' : 'shimmer 2s infinite'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '20px',
                flexShrink: 0,
                animation: 'bounce 0.6s ease-out'
              }}>
                {getIcon(notification.type)}
              </span>
              
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '1.4'
                }}>
                  {notification.message}
                </p>
                
                {notification.type === 'confirm' && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px'
                  }}>
                    <button
                      onClick={() => handleConfirm(notification)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleCancel(notification)}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {notification.type !== 'confirm' && (
                <button
                  onClick={() => removeNotification(notification.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text,
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 1}
                  onMouseOut={(e) => e.target.style.opacity = 0.7}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )
      })}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-4px); }
            60% { transform: translateY(-2px); }
          }
        `
      }} />
    </div>
  )
}