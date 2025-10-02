'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function SilverReports() {
  const [analytics, setAnalytics] = useState({
    monthlySales: [],
    monthlyOrders: [],
    monthlyLoans: [],
    monthlyLoanAmount: [],
    monthlyMakingCharge: [],
    monthlyTotalDue: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewType, setViewType] = useState('monthly')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedYear, viewType])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/silver?year=${selectedYear}&view=${viewType}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setAnalytics(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching silver analytics:', error)
      setLoading(false)
    }
  }

  const SimpleChart = ({ data, title, color, prefix = '' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1)
    
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{marginBottom: '1rem', color: '#333'}}>{title}</h3>
        <div style={{display: 'flex', alignItems: 'end', gap: '0.3rem', height: '200px', overflow: 'visible', padding: '0', width: '100%', minWidth: '0'}}>
          {data.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 0',
              minWidth: '0',
              maxWidth: 'calc(100% / 12)'
            }}>
              <div style={{
                backgroundColor: color,
                width: '100%',
                height: `${(item.value / maxValue) * 140}px`,
                minHeight: '10px',
                borderRadius: '4px 4px 0 0',
                marginBottom: '0.5rem',
                position: 'relative',
                maxHeight: '140px'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#333',
                  whiteSpace: 'nowrap'
                }}>
                  {prefix}{item.value}
                </div>
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#666',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}>
                {item.month}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '3rem'}}>
        <h2>Loading Silver Analytics...</h2>
      </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2 style={{color: '#333'}}>🥈 Silver Reports & Analytics</h2>
        <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <label style={{fontWeight: 'bold', color: '#333'}}>View:</label>
            <select 
              value={viewType} 
              onChange={(e) => setViewType(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <label style={{fontWeight: 'bold', color: '#333'}}>Year:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
        <SimpleChart 
          data={analytics.monthlySales} 
          title={`${viewType === 'monthly' ? 'Monthly' : 'Yearly'} Silver Sales (₹)`} 
          color="#6c757d"
          prefix="₹"
        />
        
        <SimpleChart 
          data={analytics.monthlyOrders} 
          title={`${viewType === 'monthly' ? 'Monthly' : 'Yearly'} Silver Orders`} 
          color="#495057"
        />
        
        <SimpleChart 
          data={analytics.monthlyLoans} 
          title={`${viewType === 'monthly' ? 'Monthly' : 'Yearly'} Silver Approved Loans`} 
          color="#adb5bd"
        />
        
        <SimpleChart 
          data={analytics.monthlyLoanAmount} 
          title={`${viewType === 'monthly' ? 'Monthly' : 'Yearly'} Silver Loan Amount (₹)`} 
          color="#868e96"
          prefix="₹"
        />
        
        <SimpleChart 
          data={analytics.monthlyMakingCharge} 
          title={`${viewType === 'monthly' ? 'Monthly Silver Making Charge' : 'Yearly Silver Actual Making Charge'} (₹)`} 
          color="#6c757d"
          prefix="₹"
        />
        
        {viewType === 'yearly' && analytics.monthlyTotalDue && analytics.monthlyTotalDue.length > 0 && (
          <SimpleChart 
            data={analytics.monthlyTotalDue} 
            title="Yearly Silver Total Due Amount (₹)" 
            color="#fd7e14"
            prefix="₹"
          />
        )}
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '2rem'
      }}>
        <h3 style={{marginBottom: '1rem', color: '#333'}}>Silver Summary Statistics</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            <h4 style={{color: '#6c757d', margin: '0 0 0.5rem 0'}}>Total Silver Sales</h4>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
              ₹{analytics.monthlySales.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </p>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            <h4 style={{color: '#495057', margin: '0 0 0.5rem 0'}}>Total Silver Orders</h4>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
              {analytics.monthlyOrders.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            <h4 style={{color: '#adb5bd', margin: '0 0 0.5rem 0'}}>Total Silver Loans</h4>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
              {analytics.monthlyLoans.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            <h4 style={{color: '#868e96', margin: '0 0 0.5rem 0'}}>Total Silver Loan Amount</h4>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
              ₹{analytics.monthlyLoanAmount.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </p>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            <h4 style={{color: '#6c757d', margin: '0 0 0.5rem 0'}}>Total Silver {viewType === 'monthly' ? 'Making Charge' : 'Actual Making Charge'}</h4>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
              ₹{analytics.monthlyMakingCharge.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </p>
          </div>
          {viewType === 'yearly' && analytics.monthlyTotalDue && analytics.monthlyTotalDue.length > 0 && (
            <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
              <h4 style={{color: '#fd7e14', margin: '0 0 0.5rem 0'}}>Total Silver Due Amount</h4>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
                ₹{analytics.monthlyTotalDue.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}