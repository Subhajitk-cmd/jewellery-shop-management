'use client'
import { useState } from 'react'

export default function ExistingOrders() {
  const navigateTo = (path) => {
    window.location.href = path
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Existing Orders</h2>
      <div className="two-column-grid">
        <div className="dashboard-card" onClick={() => navigateTo('/existing-orders/booked')} style={{borderLeft: '4px solid #FFD700', maxWidth: '300px'}}>
          <h3>Booked Orders</h3>
          <p>View and manage booked orders</p>
        </div>
        <div className="dashboard-card" onClick={() => navigateTo('/existing-orders/closed')} style={{borderLeft: '4px solid #FFD700', maxWidth: '300px'}}>
          <h3>Closed Orders</h3>
          <p>View completed orders</p>
        </div>
      </div>
    </div>
  )
}