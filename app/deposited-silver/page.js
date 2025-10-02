'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '../utils/toast'
import MasterLogin from '../components/MasterLogin'
import { showConfirmDialog, showNotification } from '../components/ModernNotification'

export default function DepositedSilver() {
  const [silverLoans, setSilverLoans] = useState([])
  const [filteredLoans, setFilteredLoans] = useState([])
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [editData, setEditData] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionType, setActionType] = useState('')
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false)

  useEffect(() => {
    fetchSilverLoans()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredLoans(silverLoans)
    } else {
      setFilteredLoans(silverLoans.filter(loan => loan.status === statusFilter))
    }
  }, [silverLoans, statusFilter])

  const fetchSilverLoans = async () => {
    try {
      const response = await axios.get('/api/goldloan/search?metalType=silver', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setSilverLoans(response.data)
      setFilteredLoans(response.data)
    } catch (error) {
      console.error('Error fetching silver loans:', error)
    }
  }

  const handleLoanClick = async (loan, action) => {
    setSelectedLoan(loan)
    setActionType(action)
    const dateValue = loan.date ? new Date(loan.date).toISOString().slice(0, 16) : ''
    
    let currentLoan = loan
    if (action === 'add_amount' || action === 'close_loan') {
      try {
        const response = await axios.get(`/api/goldloan/search/${loan._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        currentLoan = response.data
        setSelectedLoan(currentLoan)
      } catch (error) {
        console.error('Error fetching current loan:', error)
      }
    }
    
    if (action === 'close_loan') {
      try {
        const response = await axios.get(`/api/goldloan/search/${loan._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        currentLoan = response.data
        setSelectedLoan(currentLoan)
      } catch (error) {
        console.error('Error fetching current loan:', error)
      }
    }
    
    if (action === 'add_amount') {
      setEditData({
        paymentAmount: '',
        paymentDate: new Date().toISOString().slice(0, 16)
      })
    } else {
      setEditData({
        customerName: currentLoan.customerName || '',
        customerAddress: currentLoan.customerAddress || '',
        date: dateValue,
        itemName: currentLoan.itemName || '',
        itemWeight: currentLoan.itemWeight || '',
        loanAmount: currentLoan.loanAmount || '',
        totalAmount: parseFloat(currentLoan.loanAmount) + parseFloat(currentLoan.interestValue || 0),
        status: 'handed_over',
        totalAmountToBePaid: ''
      })
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => {
      const updated = { ...prev, [name]: value }
      
      if (name === 'interestValue' || name === 'loanAmount') {
        const loanAmount = parseFloat(updated.loanAmount) || 0
        const interestValue = parseFloat(updated.interestValue) || 0
        updated.totalAmount = loanAmount + interestValue
      }
      
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = { ...editData }
      
      if (actionType === 'add_amount') {
        submitData.newPaymentAmount = parseFloat(editData.paymentAmount)
        submitData.newPaymentDate = editData.paymentDate
        delete submitData.paymentAmount
        delete submitData.paymentDate
      }
      
      await axios.put(`/api/goldloan/search/${selectedLoan._id}`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      showNotification(actionType === 'add_amount' ? 'Payment added successfully!' : 'Silver loan updated successfully!', 'success')
      setSelectedLoan(null)
      setActionType('')
      fetchSilverLoans()
    } catch (error) {
      console.error('Update error:', error)
      showNotification('Error updating silver loan', 'error')
    }
  }

  const handleDelete = async (loanId) => {
    showConfirmDialog(
      'Are you sure you want to delete this silver loan?',
      async () => {
        try {
          await axios.delete(`/api/goldloan/search/${loanId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          showNotification('Silver loan deleted successfully!', 'success')
          fetchSilverLoans()
        } catch (error) {
          showNotification('Error deleting silver loan', 'error')
        }
      }
    )
  }

  if (selectedLoan) {
    return (
      <div className="form-container" style={{borderLeft: '4px solid #C0C0C0'}}>
        <h2>{actionType === 'add_amount' ? 'Add Payment' : 'Close Loan'} - {selectedLoan.customerName}</h2>
        <form onSubmit={handleSubmit}>
          {actionType === 'add_amount' ? (
            <>
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  name="paymentAmount"
                  value={editData.paymentAmount}
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
              {selectedLoan.paymentHistory && selectedLoan.paymentHistory.length > 0 && (
                <div className="form-group">
                  <label>Payment History</label>
                  <div style={{backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto'}}>
                    {selectedLoan.paymentHistory.map((payment, index) => (
                      <div key={index} style={{padding: '0.5rem', backgroundColor: '#f5f5f5', margin: '0.25rem 0', borderRadius: '3px', border: '1px solid #C0C0C0'}}>
                        <strong>₹{payment.amount}</strong> - {new Date(payment.date).toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Customer's Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={editData.customerName}
                  onChange={handleEditChange}
                  required
                />
              </div>
          <div className="form-group">
            <label>Customer's Address</label>
            <textarea
              name="customerAddress"
              value={editData.customerAddress}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="datetime-local"
              name="date"
              value={editData.date}
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
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Item Weight</label>
            <input
              type="number"
              step="0.01"
              name="itemWeight"
              value={editData.itemWeight}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Loan Amount</label>
            <input
              type="number"
              name="loanAmount"
              value={editData.loanAmount}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={editData.totalAmount || 0}
              readOnly
              style={{backgroundColor: '#f5f5f5'}}
            />
          </div>
          <div className="form-group">
            <label>Total Amount to be Paid (Interest + Principle) *</label>
            <input
              type="number"
              name="totalAmountToBePaid"
              value={editData.totalAmountToBePaid || ''}
              onChange={handleEditChange}
              required
            />
          </div>
          {selectedLoan.paymentHistory && selectedLoan.paymentHistory.length > 0 && (
            <div className="form-group">
              <label>Payment History</label>
              <div style={{backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto'}}>
                {selectedLoan.paymentHistory.map((payment, index) => (
                  <div key={index} style={{padding: '0.5rem', backgroundColor: '#fff3cd', margin: '0.25rem 0', borderRadius: '3px', border: '1px solid #ffeaa7'}}>
                    <strong>₹{payment.amount}</strong> - {new Date(payment.date).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={editData.status || 'pending'}
              onChange={handleEditChange}
            >
              <option value="pending">Pending Loan</option>
              <option value="handed_over">Closed Loan</option>
            </select>
          </div>
              </>
            )}
          <div style={{display: 'flex', gap: '1rem'}}>
            <button type="submit" className="btn">{actionType === 'add_amount' ? 'Add Payment' : 'Close Loan'}</button>
            <button type="button" className="btn" onClick={() => {setSelectedLoan(null); setActionType('')}}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Search Deposited Silver</h2>
        <MasterLogin onMasterLogin={setIsMasterLoggedIn} />
      </div>
      <div className="search-container">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="search-input"
        >
          <option value="all">All Loans</option>
          <option value="pending">Pending Loan</option>
          <option value="handed_over">Closed Loan</option>
        </select>
      </div>
      <div className="orders-list">
        {filteredLoans.map(loan => (
          <div key={loan._id} className="order-item" style={{borderLeft: '4px solid #C0C0C0'}}>
            <h4>Customer: {loan.customerName}</h4>
            <p>Item: {loan.itemName}</p>
            <p>Weight: {loan.itemWeight}g</p>
            <p>Loan Amount: ₹{loan.loanAmount}</p>
            {loan.interestValue && (
              <>
                <p>Interest Value: ₹{loan.interestValue}</p>
                <p>Total Amount: ₹{loan.totalAmount}</p>
              </>
            )}
            <p>Date: {new Date(loan.date).toLocaleString()}</p>
            {loan.status === 'handed_over' && loan.totalAmountToBePaid && (
              <p><strong>Total Amount Paid: ₹{loan.totalAmountToBePaid}</strong></p>
            )}
            {loan.updatedAt && (
              <p>Last Updated: {new Date(loan.updatedAt).toLocaleString()}</p>
            )}
            {(loan.paymentHistory && loan.paymentHistory.length > 0) || (loan.status === 'handed_over' && loan.totalAmountToBePaid) ? (
              <div style={{marginTop: '0.5rem'}}>
                <strong>Payment History:</strong>
                {loan.paymentHistory && loan.paymentHistory.map((payment, index) => (
                  <div key={index} style={{fontSize: '0.9rem', padding: '0.4rem 0.6rem', backgroundColor: '#f5f5f5', margin: '0.3rem 0', borderRadius: '4px', border: '1px solid #C0C0C0'}}>
                    <strong>₹{payment.amount}</strong> paid on {new Date(payment.date).toLocaleString()}
                  </div>
                ))}
                {loan.status === 'handed_over' && loan.totalAmountToBePaid && (
                  <div style={{fontSize: '0.9rem', padding: '0.4rem 0.6rem', backgroundColor: '#d4edda', margin: '0.3rem 0', borderRadius: '4px', border: '1px solid #c3e6cb'}}>
                    <strong>₹{loan.totalAmountToBePaid}</strong> - Final Payment on {new Date(loan.closureDate || loan.updatedAt).toLocaleString()} (Loan Closed)
                  </div>
                )}
              </div>
            ) : null}
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              {loan.status !== 'handed_over' && (
                <>
                  <button 
                    className="btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLoanClick(loan, 'add_amount')
                    }}
                    style={{fontSize: '0.9rem', padding: '0.3rem 0.6rem'}}
                  >
                    Add Amount
                  </button>
                  <button 
                    className="btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLoanClick(loan, 'close_loan')
                    }}
                    style={{fontSize: '0.9rem', padding: '0.3rem 0.6rem'}}
                  >
                    Close Loan
                  </button>
                </>
              )}
              {loan.status === 'pending' && isMasterLoggedIn && (
                <button 
                  className="btn" 
                  style={{backgroundColor: '#e74c3c', fontSize: '0.9rem', padding: '0.3rem 0.6rem'}}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(loan._id)
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredLoans.length === 0 && (
          <p style={{textAlign: 'center', padding: '2rem'}}>No silver loans found for selected status</p>
        )}
      </div>
    </div>
  )
}