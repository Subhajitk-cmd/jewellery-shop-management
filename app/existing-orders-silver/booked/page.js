'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '../../utils/toast'
import MasterLogin from '../../components/MasterLogin'
import { showConfirmDialog, showNotification } from '../../components/ModernNotification'

export default function BookedSilverOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editData, setEditData] = useState({})
  const [actionType, setActionType] = useState('')
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false)

  useEffect(() => {
    fetchBookedOrders()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOrders(filtered)
    } else {
      setFilteredOrders(orders)
    }
  }, [searchTerm, orders])

  const fetchBookedOrders = async () => {
    try {
      const response = await axios.get('/api/orders/booked?metalType=silver', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setOrders(response.data)
      setFilteredOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleOrderClick = async (order, action) => {
    setSelectedOrder(order)
    setActionType(action)
    const dateValue = order.dateOfBooking ? new Date(order.dateOfBooking).toISOString().slice(0, 16) : ''
    
    let currentOrder = order
    if (action === 'advance') {
      try {
        const response = await axios.get(`/api/orders/booked/${order._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        currentOrder = response.data
        setSelectedOrder(currentOrder)
      } catch (error) {
        console.error('Error fetching current order:', error)
      }
    }
    
    if (action === 'advance') {
      setEditData({
        newAdvance: '',
        paymentDate: new Date().toISOString().slice(0, 16)
      })
    } else if (action === 'delivery') {
      setEditData({
        ...currentOrder,
        dateOfBooking: dateValue,
        itemActualValue: '',
        itemActualWeight: '',
        customerPaid: '',
        dateOfDelivery: '',
        actualMakingCharge: '',
        status: currentOrder.status || 'booked'
      })
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => {
      const updated = { ...prev, [name]: value }
      
      if (actionType === 'delivery' && (name === 'itemActualValue' || name === 'actualMakingCharge' || name === 'advance')) {
        const actualValue = parseFloat(updated.itemActualValue) || 0
        const actualMakingCharge = parseFloat(updated.actualMakingCharge) || 0
        const advance = parseFloat(updated.advance) || 0
        updated.totalDue = (actualValue + actualMakingCharge) - advance
      }
      
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate delivery submission requires closed status
    if (actionType === 'delivery' && editData.status !== 'closed') {
      showNotification('Please set status to "Closed" to submit delivery', 'error')
      return
    }
    
    try {
      const submitData = { ...editData }
      
      if (actionType === 'advance' && editData.newAdvance) {
        const currentAdvance = parseFloat(selectedOrder.advance) || 0
        const newAdvance = parseFloat(editData.newAdvance) || 0
        submitData.advance = currentAdvance + newAdvance
        submitData.newAdvanceAmount = newAdvance
        submitData.newAdvanceDate = editData.paymentDate
        delete submitData.newAdvance
        delete submitData.paymentDate
      }
      
      await axios.put(`/api/orders/booked/${selectedOrder._id}`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (editData.status === 'closed') {
        showNotification('Silver order moved to closed orders successfully!', 'success')
      } else {
        showNotification('Silver order updated successfully!', 'success')
      }
      
      setSelectedOrder(null)
      setActionType('')
      fetchBookedOrders()
    } catch (error) {
      showNotification('Error updating silver order', 'error')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    showConfirmDialog(
      'Are you sure you want to delete this silver order? This action cannot be undone.',
      async () => {
        try {
          await axios.delete(`/api/orders/booked/${orderId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          showNotification('Silver order deleted successfully!', 'success')
          fetchBookedOrders()
        } catch (error) {
          showNotification('Error deleting silver order', 'error')
        }
      }
    )
  }

  if (selectedOrder) {
    return (
      <div className="form-container" style={{borderLeft: '4px solid #C0C0C0'}}>
        <h2>{actionType === 'advance' ? 'Add Advance' : 'Delivery'} - {selectedOrder.orderId}</h2>
        <form onSubmit={handleSubmit}>
          {actionType === 'delivery' && (
            <>
              <div className="form-group">
                <label>Customer's Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={editData.customerName}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Customer's Address</label>
                <textarea
                  name="customerAddress"
                  value={editData.customerAddress}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Date of Booking</label>
                <input
                  type="datetime-local"
                  name="dateOfBooking"
                  value={editData.dateOfBooking}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Aadhar ID</label>
                <input
                  type="text"
                  name="aadharId"
                  value={editData.aadharId}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={editData.itemName}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Item Estimated Weight</label>
                <input
                  type="number"
                  step="0.01"
                  name="itemEstimatedWeight"
                  value={editData.itemEstimatedWeight}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Item Estimated Value</label>
                <input
                  type="number"
                  name="itemEstimatedValue"
                  value={editData.itemEstimatedValue}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
            </>
          )}
          {actionType === 'advance' && (
            <>
              <div className="form-group">
                <label>Advance Amount *</label>
                <input
                  type="number"
                  name="newAdvance"
                  value={editData.newAdvance}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="datetime-local"
                  name="paymentDate"
                  value={editData.paymentDate}
                  onChange={handleEditChange}
                  required
                />
              </div>
              {(() => {
                const allPayments = []
                // Calculate initial advance from total advance minus payment history
                const totalAdvance = parseFloat(selectedOrder.advance) || 0
                const additionalPayments = selectedOrder.paymentHistory || []
                const additionalTotal = additionalPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                const initialAdvance = totalAdvance - additionalTotal
                
                if (initialAdvance > 0) {
                  allPayments.push({ amount: initialAdvance, date: selectedOrder.dateOfBooking })
                }
                if (additionalPayments.length > 0) {
                  allPayments.push(...additionalPayments)
                }
                return allPayments.length > 0 && (
                  <div className="form-group">
                    <label>Payment History</label>
                    <div style={{backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto'}}>
                      {allPayments.map((payment, index) => (
                        <div key={index} style={{padding: '0.5rem', backgroundColor: '#f5f5f5', margin: '0.25rem 0', borderRadius: '3px', border: '1px solid #C0C0C0'}}>
                          <strong>₹{payment.amount}</strong> - {new Date(payment.date).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </>
          )}
          
          {actionType === 'delivery' && (
            <>
              <div className="form-group">
                <label>Item Actual Value *</label>
                <input
                  type="number"
                  name="itemActualValue"
                  value={editData.itemActualValue}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Item Actual Weight *</label>
                <input
                  type="number"
                  step="0.01"
                  name="itemActualWeight"
                  value={editData.itemActualWeight}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Advance</label>
                <input
                  type="number"
                  name="advance"
                  value={editData.advance}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Making Charge (Estimated)</label>
                <input
                  type="number"
                  name="makingCharge"
                  value={editData.makingCharge}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Actual Making Charge *</label>
                <input
                  type="number"
                  name="actualMakingCharge"
                  value={editData.actualMakingCharge}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Due</label>
                <input
                  type="number"
                  name="totalDue"
                  value={editData.totalDue || 0}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>Customer Paid During Delivery *</label>
                <input
                  type="number"
                  name="customerPaid"
                  value={editData.customerPaid}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Delivery *</label>
                <input
                  type="datetime-local"
                  name="dateOfDelivery"
                  value={editData.dateOfDelivery}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  required
                >
                  <option value="booked">Booked</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </>
          )}
          <div style={{display: 'flex', gap: '1rem'}}>
            <button type="submit" className="btn">
              {actionType === 'advance' ? 'Add Advance' : 'Submit Delivery'}
            </button>
            <button type="button" className="btn" onClick={() => {setSelectedOrder(null); setActionType('')}}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Booked Silver Orders</h2>
        <MasterLogin onMasterLogin={setIsMasterLoggedIn} />
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Order ID or Customer Name"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order._id} className="order-item" style={{borderLeft: '4px solid #C0C0C0'}}>
            <h4>Order ID: {order.orderId}</h4>
            <p>Customer: {order.customerName}</p>
            <p>Item: {order.itemName}</p>
            <p>Estimated Value: ₹{order.itemEstimatedValue || 0}</p>
            <p>Date of Booking: {new Date(order.dateOfBooking).toLocaleString()}</p>
            <p>Total Advance: ₹{order.advance || 0}</p>
            {(() => {
              const allPayments = []
              // Calculate initial advance from total advance minus payment history
              const totalAdvance = parseFloat(order.advance) || 0
              const additionalPayments = order.paymentHistory || []
              const additionalTotal = additionalPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
              const initialAdvance = totalAdvance - additionalTotal
              
              if (initialAdvance > 0) {
                allPayments.push({ amount: initialAdvance, date: order.dateOfBooking })
              }
              if (additionalPayments.length > 0) {
                allPayments.push(...additionalPayments)
              }
              return allPayments.length > 0 && (
                <div style={{marginTop: '0.5rem'}}>
                  <strong>Advance Payments:</strong>
                  {allPayments.map((payment, index) => (
                    <div key={index} style={{fontSize: '0.9rem', padding: '0.4rem 0.6rem', backgroundColor: '#f5f5f5', margin: '0.3rem 0', borderRadius: '4px', border: '1px solid #C0C0C0'}}>
                      <strong>₹{payment.amount}</strong> paid on {new Date(payment.date).toLocaleString()}
                    </div>
                  ))}
                </div>
              )
            })()}
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <button 
                className="btn" 
                onClick={() => handleOrderClick(order, 'advance')}
                style={{fontSize: '0.9rem', padding: '0.3rem 0.6rem'}}
              >
                Add Advance
              </button>
              <button 
                className="btn" 
                onClick={() => handleOrderClick(order, 'delivery')}
                style={{fontSize: '0.9rem', padding: '0.3rem 0.6rem'}}
              >
                Delivery
              </button>
              {isMasterLoggedIn && (
                <button 
                  className="btn" 
                  onClick={() => handleDeleteOrder(order._id)}
                  style={{
                    fontSize: '0.9rem', 
                    padding: '0.3rem 0.6rem',
                    backgroundColor: '#dc3545',
                    color: 'white'
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p style={{textAlign: 'center', padding: '2rem'}}>No booked silver orders found</p>
        )}
      </div>
    </div>
  )
}