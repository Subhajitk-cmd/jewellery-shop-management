'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [prices, setPrices] = useState({ gold: 0, silver: 0 })
  const [editMode, setEditMode] = useState(false)
  const [editPrices, setEditPrices] = useState({ gold: '', silver: '' })
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchPrices()
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const fetchPrices = async () => {
    try {
      const response = await axios.get('/api/prices')
      setPrices(response.data)
      setEditPrices(response.data)
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }

  const handlePriceUpdate = async () => {
    try {
      await axios.put('/api/prices/update', editPrices, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setPrices(editPrices)
      setEditMode(false)
      alert('Prices updated successfully!')
    } catch (error) {
      alert('Error updating prices')
    }
  }

  const navigateTo = (path) => {
    window.location.href = path
  }

  return (
    <div>
      {/* Modern Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem 0',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: '0 0 20px 20px'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            margin: '0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💎 JEWEL SHOP 💎
          </h1>
          {user && (
            <>
              <style jsx>{`
                @keyframes glow {
                  0%, 100% { text-shadow: 1px 1px 2px rgba(0,0,0,0.2), 0 0 10px rgba(255,215,0,0.3); }
                  50% { text-shadow: 1px 1px 2px rgba(0,0,0,0.2), 0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.6); }
                }
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
              `}</style>
              <p style={{
                fontSize: '1.5rem',
                margin: '1rem 0 0 0',
                fontWeight: '300',
                animation: 'glow 2s ease-in-out infinite'
              }}>
                Welcome back, <span style={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}>{user.name}</span>! ✨
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="price-section">
        <h2>Current Metal Prices</h2>
        <div className="price-grid">
          <div className="price-card">
            <h3>Gold Price</h3>
            {editMode ? (
              <input
                type="number"
                value={editPrices.gold}
                onChange={(e) => setEditPrices({...editPrices, gold: e.target.value})}
                style={{padding: '0.5rem', fontSize: '1.2rem', width: '120px'}}
              />
            ) : (
              <div className="price">₹{prices.gold}/10g</div>
            )}
          </div>
          <div className="price-card">
            <h3>Silver Price</h3>
            {editMode ? (
              <input
                type="number"
                value={editPrices.silver}
                onChange={(e) => setEditPrices({...editPrices, silver: e.target.value})}
                style={{padding: '0.5rem', fontSize: '1.2rem', width: '120px'}}
              />
            ) : (
              <div className="price">₹{prices.silver}/10g</div>
            )}
          </div>
        </div>
        {user && (
          <div style={{textAlign: 'center', marginTop: '1rem'}}>
            {editMode ? (
              <>
                <button className="btn" onClick={handlePriceUpdate} style={{marginRight: '0.5rem'}}>Save Prices</button>
                <button className="btn" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn" onClick={() => setEditMode(true)}>Edit Prices</button>
            )}
          </div>
        )}
      </div>

      {user && (
        <div className="dashboard">
          <div className="dashboard-card" onClick={() => navigateTo('/new-order')} style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(255, 215, 0, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>✦ New Order(Gold)</h3>
            <p>Create a new jwellery order</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/existing-orders')} style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(255, 215, 0, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>✿ Existing Orders(Gold)</h3>
            <p>View and manage existing orders</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/gold-loan')} style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(255, 215, 0, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>❀ Submit Items For Gold Loan</h3>
            <p>Submit jwellery items for gold loan</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/deposited-gold')} style={{background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(255, 215, 0, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>❁ Search Deposited Gold</h3>
            <p>Search and manage deposited gold items</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/new-order-silver')} style={{background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(192, 192, 192, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>❂ New Order(Silver)</h3>
            <p>Create a new silver jwellery order</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/existing-orders-silver')} style={{background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(192, 192, 192, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>❃ Existing Orders(Silver)</h3>
            <p>View and manage existing silver orders</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/silver-loan')} style={{background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(192, 192, 192, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>❄ Submit Items For Silver Loan</h3>
            <p>Submit jwellery items for silver loan</p>
          </div>
          <div className="dashboard-card" onClick={() => navigateTo('/deposited-silver')} style={{background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', fontWeight: 'bold', color: '#000', boxShadow: '0 8px 16px rgba(192, 192, 192, 0.3)', transform: 'translateY(-2px)', transition: 'all 0.3s ease'}}>
            <h3 style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>❅ Search Deposited Silver</h3>
            <p>Search and manage deposited silver items</p>
          </div>
        </div>
      )}

      {!user && (
        <div className="form-container" style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '15px',
          padding: '3rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>Welcome to Jewel Shop 💎</h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2rem'
          }}>Please login or sign up to access the dashboard features.</p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <button 
              className="btn" 
              onClick={() => window.location.href = '/login'}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                borderRadius: '25px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              Login
            </button>
            <button 
              className="btn" 
              onClick={() => window.location.href = '/signup'}
              style={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                borderRadius: '25px',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  )
}