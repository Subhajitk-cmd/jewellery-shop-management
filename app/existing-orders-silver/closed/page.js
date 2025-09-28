'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'

export default function ClosedSilverOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchClosedOrders()
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

  const generateBill = (order) => {
    const doc = new jsPDF()
    const user = JSON.parse(localStorage.getItem('user'))
    
    // Header with border
    doc.rect(10, 10, 190, 40)
    doc.setFontSize(22)
    doc.setFont(undefined, 'bold')
    doc.text(user?.name?.toUpperCase() || 'JEWEL SHOP', 105, 25, { align: 'center' })
    doc.setFontSize(14)
    doc.text('SILVER JEWELRY INVOICE', 105, 35, { align: 'center' })
    doc.setFontSize(10)
    doc.text('GST No: 29XXXXX1234X1ZX', 105, 45, { align: 'center' })
    
    // Bill details box
    doc.rect(10, 55, 90, 25)
    doc.rect(110, 55, 90, 25)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text('BILL TO:', 15, 65)
    doc.text('INVOICE DETAILS:', 115, 65)
    
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`${order.customerName}`, 15, 72)
    doc.text(`${order.customerAddress}`, 15, 77, { maxWidth: 80 })
    
    doc.text(`Invoice No: ${order.orderId}`, 115, 72)
    doc.text(`Date: ${new Date(order.dateOfDelivery).toLocaleDateString()}`, 115, 77)
    
    // Items table header
    doc.rect(10, 85, 190, 15)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(10)
    doc.text('DESCRIPTION', 15, 94)
    doc.text('WEIGHT', 80, 94)
    doc.text('RATE', 120, 94)
    doc.text('AMOUNT', 170, 94)
    
    // Items table content
    doc.rect(10, 100, 190, 15)
    doc.setFont(undefined, 'normal')
    doc.text(`${order.itemName}`, 15, 109)
    doc.text(`${order.itemActualWeight}g`, 80, 109)
    doc.text(`Rs.${(order.itemActualValue/order.itemActualWeight).toFixed(0)}/g`, 120, 109)
    doc.text(`Rs.${order.itemActualValue}`, 170, 109)
    
    // Making charges
    doc.rect(10, 115, 190, 10)
    doc.text('Making Charges', 15, 122)
    doc.text(`Rs.${order.makingCharge}`, 170, 122)
    
    // Subtotal
    doc.rect(10, 125, 190, 10)
    doc.setFont(undefined, 'bold')
    doc.text('SUBTOTAL', 15, 132)
    doc.text(`Rs.${parseInt(order.itemActualValue) + parseInt(order.makingCharge)}`, 170, 132)
    
    // Payment details
    doc.rect(10, 140, 190, 30)
    doc.setFont(undefined, 'bold')
    doc.text('PAYMENT DETAILS:', 15, 150)
    doc.setFont(undefined, 'normal')
    doc.text(`Total Advance Paid: Rs.${order.advance}`, 15, 157)
    doc.text(`Final Payment: Rs.${order.customerPaid}`, 15, 164)
    
    // Payment history
    if (order.paymentHistory && order.paymentHistory.length > 0) {
      doc.rect(10, 175, 190, 40)
      doc.setFont(undefined, 'bold')
      doc.text('ADVANCE PAYMENT HISTORY:', 15, 185)
      doc.setFont(undefined, 'normal')
      let yPos = 192
      order.paymentHistory.forEach((payment, index) => {
        doc.text(`${index + 1}. Rs.${payment.amount} - ${new Date(payment.date).toLocaleDateString()}`, 15, yPos)
        yPos += 7
      })
    }
    
    // Footer
    doc.rect(10, 250, 190, 30)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(12)
    doc.text('Thank You for Your Business!', 105, 265, { align: 'center' })
    doc.setFontSize(10)
    doc.text('This is a computer generated invoice', 105, 272, { align: 'center' })
    
    const customerName = order.customerName.replace(/[^a-zA-Z0-9]/g, '_')
    doc.save(`${order.orderId}_${customerName}.pdf`)
  }

  const fetchClosedOrders = async () => {
    try {
      const response = await axios.get('/api/orders/closed?metalType=silver', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setOrders(response.data)
      setFilteredOrders(response.data)
    } catch (error) {
      console.error('Error fetching closed silver orders:', error)
    }
  }

  if (selectedOrder) {
    return (
      <div className="form-container" style={{borderLeft: '4px solid #C0C0C0'}}>
        <h2>Order Details - {selectedOrder.orderId}</h2>
        <div className="form-group">
          <label>Customer's Name</label>
          <input type="text" value={selectedOrder.customerName} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Customer's Address</label>
          <textarea value={selectedOrder.customerAddress} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Date of Booking</label>
          <input type="text" value={new Date(selectedOrder.dateOfBooking).toLocaleString()} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Aadhar ID</label>
          <input type="text" value={selectedOrder.aadharId || 'N/A'} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Item Name</label>
          <input type="text" value={selectedOrder.itemName} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Item Actual Weight</label>
          <input type="text" value={selectedOrder.itemActualWeight + 'g'} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Item Actual Value</label>
          <input type="text" value={'₹' + selectedOrder.itemActualValue} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Advance</label>
          <input type="text" value={'₹' + selectedOrder.advance} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Making Charge</label>
          <input type="text" value={'₹' + selectedOrder.makingCharge} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Customer Paid</label>
          <input type="text" value={'₹' + selectedOrder.customerPaid} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        <div className="form-group">
          <label>Date of Delivery</label>
          <input type="text" value={new Date(selectedOrder.dateOfDelivery).toLocaleString()} readOnly style={{backgroundColor: '#f5f5f5'}} />
        </div>
        {selectedOrder.paymentHistory && selectedOrder.paymentHistory.length > 0 && (
          <div className="form-group">
            <label>Advance Payment History</label>
            <div style={{backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto'}}>
              {selectedOrder.paymentHistory.map((payment, index) => (
                <div key={index} style={{padding: '0.5rem', backgroundColor: '#f5f5f5', margin: '0.25rem 0', borderRadius: '3px', border: '1px solid #C0C0C0'}}>
                  <strong>₹{payment.amount}</strong> - {new Date(payment.date).toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn" onClick={() => generateBill(selectedOrder)}>Generate Bill</button>
          <button className="btn" onClick={() => setSelectedOrder(null)}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2>Closed Silver Orders</h2>
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
            <p>Customer Paid: ₹{order.customerPaid}</p>
            <p>Date of Delivery: {new Date(order.dateOfDelivery).toLocaleString()}</p>
            <div style={{marginTop: '0.5rem'}}>
              <button 
                className="btn" 
                onClick={() => setSelectedOrder(order)}
                style={{fontSize: '0.9rem', padding: '0.3rem 0.6rem'}}
              >
                See More
              </button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p style={{textAlign: 'center', padding: '2rem'}}>No closed silver orders found</p>
        )}
      </div>
    </div>
  )
}