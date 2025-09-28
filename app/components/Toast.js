'use client'
import { useState, useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getToastStyle = () => {
    let background, accent, iconBg
    switch (type) {
      case 'success':
        background = 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #74b9ff 100%)'
        accent = '#00b894'
        iconBg = 'rgba(0, 184, 148, 0.2)'
        break
      case 'error':
        background = 'linear-gradient(135deg, #e17055 0%, #fd79a8 50%, #fdcb6e 100%)'
        accent = '#e17055'
        iconBg = 'rgba(225, 112, 85, 0.2)'
        break
      case 'warning':
        background = 'linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #fd79a8 100%)'
        accent = '#fdcb6e'
        iconBg = 'rgba(253, 203, 110, 0.2)'
        break
      case 'info':
      default:
        background = 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #fd79a8 100%)'
        accent = '#6c5ce7'
        iconBg = 'rgba(108, 92, 231, 0.2)'
    }

    return {
      position: 'fixed',
      top: '30px',
      right: '30px',
      padding: '1.25rem 1.75rem',
      borderRadius: '20px',
      color: 'white',
      fontWeight: '600',
      fontSize: '1rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
      zIndex: 10000,
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(255,255,255,0.1)',
      minWidth: '350px',
      maxWidth: '450px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      animation: isClosing ? 'toastSlideOut 0.3s ease-in' : 'toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      background,
      accent,
      iconBg
    }
  }

  const getIconData = () => {
    const style = getToastStyle()
    switch (type) {
      case 'success': 
        return { icon: '✓' }
      case 'error': 
        return { icon: '✕' }
      case 'warning': 
        return { icon: '⚠' }
      case 'info':
      default: 
        return { icon: 'i' }
    }
  }

  const iconData = getIconData()
  const toastStyle = getToastStyle()

  return (
    <>
      <style jsx>{`
        @keyframes toastSlideIn {
          0% {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-10%) scale(1.05);
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes toastSlideOut {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes toastPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes toastProgress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        
        .toast-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          flex-shrink: 0;
          animation: toastPulse 2s infinite;
        }
        
        .toast-close-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: bold;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .toast-close-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }
        
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: ${toastStyle.accent};
          border-radius: 0 0 20px 20px;
          animation: toastProgress 4s linear;
        }
      `}</style>
      <div style={toastStyle}>
        <div className="toast-icon" style={{ background: toastStyle.iconBg, color: toastStyle.accent, border: `2px solid ${toastStyle.accent}` }}>
          {iconData.icon}
        </div>
        <div style={{ flex: 1, lineHeight: '1.4' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <div style={{ fontSize: '1rem' }}>{message}</div>
        </div>
        <button className="toast-close-btn" onClick={handleClose}>
          ×
        </button>
        <div className="toast-progress"></div>
      </div>
    </>
  )
}