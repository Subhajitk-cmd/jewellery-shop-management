'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '../utils/toast'
import { showNotification } from '../components/ModernNotification'

export default function NewOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    dateOfBooking: '',
    aadharId: '',
    itemName: '',
    itemEstimatedWeight: '',
    itemEstimatedValue: '',
    advance: '',
    makingCharge: '',
    status: 'booked'
  })
  const [goldPrice, setGoldPrice] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16)
    setFormData(prev => ({ ...prev, dateOfBooking: now }))
    fetchGoldPrice()
  }, [])

  const fetchGoldPrice = async () => {
    try {
      const response = await axios.get('/api/prices')
      setGoldPrice(response.data.gold)
    } catch (error) {
      console.error('Error fetching gold price:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = {
      ...formData,
      [name]: value
    }
    
    // Auto-calculate estimated value when weight changes
    if (name === 'itemEstimatedWeight' && value && goldPrice) {
      const weightInGrams = parseFloat(value)
      const estimatedValue = Math.round((weightInGrams / 10) * goldPrice)
      updatedData.itemEstimatedValue = estimatedValue
    }
    
    setFormData(updatedData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      showNotification('Please login first', 'error')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }
    
    try {
      const response = await axios.post('/api/orders/new', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      showNotification(`Order created successfully! Order ID: ${response.data.orderId}`, 'success')
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
      <h2>New Order</h2>
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
          <label>Date of Booking *</label>
          <input
            type="datetime-local"
            name="dateOfBooking"
            value={formData.dateOfBooking}
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
          <label>Item Estimated Weight (grams) *</label>
          <input
            type="number"
            step="0.01"
            name="itemEstimatedWeight"
            value={formData.itemEstimatedWeight}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Item Estimated Value (₹) *</label>
          <input
            type="number"
            name="itemEstimatedValue"
            value={formData.itemEstimatedValue}
            onChange={handleChange}
            readOnly
            style={{backgroundColor: '#f5f5f5'}}
            required
          />
        </div>
        <div className="form-group">
          <label>Advance (₹) *</label>
          <input
            type="number"
            name="advance"
            value={formData.advance}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Making Charge (₹) *</label>
          <input
            type="number"
            name="makingCharge"
            value={formData.makingCharge}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="booked">Booked</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit" className="btn">Submit Order</button>
      </form>
    </div>
  )
}