'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '../../utils/toast'

export default function BookedOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editData, setEditData] = useState({})
  const [actionType, setActionType] = useState('')

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
      const response = await axios.get('/api/orders/booked', {
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
    
    // Fetch fresh order data for advance action to get latest advance value
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
        customerName: currentOrder.customerName,
        customerAddress: currentOrder.customerAddress,
        dateOfBooking: dateValue,
        aadharId: currentOrder.aadharId,
        itemName: currentOrder.itemName,
        itemEstimatedWeight: currentOrder.itemEstimatedWeight,
        itemEstimatedValue: currentOrder.itemEstimatedValue,
        advance: currentOrder.advance,
        makingCharge: currentOrder.makingCharge,
        newAdvance: ''
      })
    } else if (action === 'delivery') {
      setEditData({
        ...currentOrder,
        dateOfBooking: dateValue,
        itemActualValue: '',
        itemActualWeight: '',
        customerPaid: '',
        dateOfDelivery: ''
      })
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => {
      const updated = { ...prev, [name]: value }
      
      // Calculate total due automatically for delivery
      if (actionType === 'delivery' && (name === 'itemActualValue' || name === 'advance')) {
        const actualValue = parseFloat(updated.itemActualValue) || 0
        const advance = parseFloat(updated.advance) || 0
        updated.totalDue = actualValue - advance
      }
      

      
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = { ...editData }
      
      // For add advance action, add new advance to current advance
      if (actionType === 'advance' && editData.newAdvance) {
        const currentAdvance = parseFloat(selectedOrder.advance) || 0
        const newAdvance = parseFloat(editData.newAdvance) || 0
        submitData.advance = currentAdvance + newAdvance
        submitData.newAdvanceAmount = newAdvance
        delete submitData.newAdvance
      }
      
      await axios.put(`/api/orders/booked/${selectedOrder._id}`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (editData.status === 'closed') {
        showToast('Order moved to closed orders successfully!', 'success')
      } else {
        showToast('Order updated successfully!', 'success')
      }
      
      setSelectedOrder(null)
      setActionType('')
      fetchBookedOrders()
    } catch (error) {
      showToast('Error updating order', 'error')
    }
  }

  if (selectedOrder) {
    return (
      <div className="form-container" style={{borderLeft: '4px solid #FFD700'}}>
        <h2>{actionType === 'advance' ? 'Add Advance' : 'Delivery'} - {selectedOrder.orderId}</h2>
        <form onSubmit={handleSubmit}>
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
          {actionType === 'advance' && (
            <>
              <div className="form-group">
                <label>Advance (Current)</label>
                <input
                  type="number"
                  name="advance"
                  value={editData.advance}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              <div className="form-group">
                <label>New Advance *</label>
                <input
                  type="number"
                  name="newAdvance"
                  value={editData.newAdvance}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Making Charge</label>
                <input
                  type="number"
                  name="makingCharge"
                  value={editData.makingCharge}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
              {selectedOrder.paymentHistory && selectedOrder.paymentHistory.length > 0 && (
                <div className="form-group">
                  <label>Payment History</label>
                  <div style={{backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto'}}>
                    {selectedOrder.paymentHistory.map((payment, index) => (
                      <div key={index} style={{padding: '0.5rem', backgroundColor: '#fff8dc', margin: '0.25rem 0', borderRadius: '3px', border: '1px solid #FFD700'}}>
                        <strong>₹{payment.amount}</strong> - {new Date(payment.date).toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <label>Making Charge</label>
                <input
                  type="number"
                  name="makingCharge"
                  value={editData.makingCharge}
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
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
                <label>Customer Paid *</label>
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
      <h2>Booked Orders</h2>
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
          <div key={order._id} className="order-item" style={{borderLeft: '4px solid #FFD700'}}>
            <h4>Order ID: {order.orderId}</h4>
            <p>Customer: {order.customerName}</p>
            <p>Item: {order.itemName}</p>
            <p>Date of Booking: {new Date(order.dateOfBooking).toLocaleString()}</p>
            <p>Total Advance: ₹{order.advance || 0}</p>
            {order.paymentHistory && order.paymentHistory.length > 0 && (
              <div style={{marginTop: '0.5rem'}}>
                <strong>Advance Payments:</strong>
                {order.paymentHistory.map((payment, index) => (
                  <div key={index} style={{fontSize: '0.9rem', padding: '0.4rem 0.6rem', backgroundColor: '#fff8dc', margin: '0.3rem 0', borderRadius: '4px', border: '1px solid #FFD700'}}>
                    <strong>₹{payment.amount}</strong> paid on {new Date(payment.date).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
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
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p style={{textAlign: 'center', padding: '2rem'}}>No booked orders found</p>
        )}
      </div>
    </div>
  )
}