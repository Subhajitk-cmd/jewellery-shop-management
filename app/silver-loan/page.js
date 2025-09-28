'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '../utils/toast'

export default function SilverLoan() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    date: '',
    itemName: '',
    itemWeight: '',
    loanAmount: '',
    aadharId: '',
    metalType: 'silver'
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16)
    setFormData(prev => ({ ...prev, date: now }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/goldloan/new', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setSuccessMessage('Silver loan application submitted successfully!')
      setTimeout(() => {
        window.location.href = '/'
      }, 4000)
    } catch (error) {
      setSuccessMessage('')
      alert(error.response?.data?.error || 'An error occurred')
    }
  }

  return (
    <div className="form-container" style={{borderLeft: '4px solid #C0C0C0'}}>
      <h2>Submit Items For Silver Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer's Name *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Customer's Address *</label>
          <textarea
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Item Name *</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Item Weight (grams) *</label>
          <input
            type="number"
            step="0.01"
            name="itemWeight"
            value={formData.itemWeight}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Loan Amount (₹) *</label>
          <input
            type="number"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Aadhar ID (Optional)</label>
          <input
            type="text"
            name="aadharId"
            value={formData.aadharId}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn">Submit Loan</button>
        {successMessage && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #74b9ff 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0, 184, 148, 0.3)',
            fontSize: '1.1rem',
            fontWeight: '600',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              animation: 'shimmer 2s infinite'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              ✅ {successMessage}
            </div>
            <style jsx>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}
      </form>
    </div>
  )
}