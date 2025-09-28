let toastContainer = null

export const showToast = (message, type = 'info') => {
  // Remove existing toast
  if (toastContainer) {
    document.body.removeChild(toastContainer)
  }

  // Create toast container
  toastContainer = document.createElement('div')
  toastContainer.style.cssText = `
    position: fixed;
    top: 30px;
    right: 30px;
    padding: 1.25rem 1.75rem;
    border-radius: 20px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1);
    z-index: 10000;
    backdrop-filter: blur(20px);
    border: 2px solid rgba(255,255,255,0.1);
    min-width: 350px;
    max-width: 450px;
    display: flex;
    align-items: center;
    gap: 15px;
    animation: toastSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
    overflow: hidden;
  `

  // Set background and accent based on type
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
  
  toastContainer.style.background = background

  // Add animation keyframes and styles
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
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
      
      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 0 0 20px 20px;
        animation: toastProgress 4s linear;
      }
      
      @keyframes toastProgress {
        0% { width: 100%; }
        100% { width: 0%; }
      }
    `
    document.head.appendChild(style)
  }

  // Get icon and styling based on type
  const getIconData = () => {
    switch (type) {
      case 'success': 
        return { icon: '✓', style: `background: ${iconBg}; color: #00b894; border: 2px solid #00b894;` }
      case 'error': 
        return { icon: '✕', style: `background: ${iconBg}; color: #e17055; border: 2px solid #e17055;` }
      case 'warning': 
        return { icon: '⚠', style: `background: ${iconBg}; color: #fdcb6e; border: 2px solid #fdcb6e;` }
      case 'info':
      default: 
        return { icon: 'i', style: `background: ${iconBg}; color: #6c5ce7; border: 2px solid #6c5ce7;` }
    }
  }

  const iconData = getIconData()

  // Create content with enhanced styling
  toastContainer.innerHTML = `
    <div style="
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
      ${iconData.style}
    ">${iconData.icon}</div>
    <div style="flex: 1; line-height: 1.4;">
      <div style="font-size: 0.95rem; opacity: 0.9; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.8rem;">
        ${type.charAt(0).toUpperCase() + type.slice(1)}
      </div>
      <div style="font-size: 1rem;">${message}</div>
    </div>
    <button onclick="this.parentElement.style.animation='toastSlideOut 0.3s ease-in'; setTimeout(() => this.parentElement.remove(), 300)" style="
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
    " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">×</button>
    <div class="toast-progress" style="background: ${accent};"></div>
  `

  // Add to body
  document.body.appendChild(toastContainer)

  // Auto remove after 4 seconds with slide out animation
  setTimeout(() => {
    if (toastContainer && document.body.contains(toastContainer)) {
      toastContainer.style.animation = 'toastSlideOut 0.3s ease-in'
      setTimeout(() => {
        if (document.body.contains(toastContainer)) {
          document.body.removeChild(toastContainer)
          toastContainer = null
        }
      }, 300)
    }
  }, 4000)
}