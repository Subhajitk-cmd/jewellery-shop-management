'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '../utils/toast'
import { showNotification } from '../components/ModernNotification'

export default function GoldLoan() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    date: '',
    itemName: '',
    itemWeight: '',
    loanAmount: '',
    aadharId: ''
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16)
    setFormData(prev => ({ ...prev, date: now }))
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/goldloan/new', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      showNotification('Gold loan application submitted successfully!', 'success')
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } catch (error) {
      setSuccessMessage('')
      showNotification(error.response?.data?.error || 'An error occurred', 'error')
    }
  }

  return (
    <div className="form-container" style={{borderLeft: '4px solid #FFD700'}}>
      <h2>Submit Items for Gold Loan</h2>
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
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
  )
}