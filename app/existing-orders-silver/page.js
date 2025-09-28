'use client'
import { useState } from 'react'

export default function ExistingOrdersSilver() {
  const navigateTo = (path) => {
    window.location.href = path
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Existing Silver Orders</h2>
      <div className="two-column-grid">
        <div className="dashboard-card" onClick={() => navigateTo('/existing-orders-silver/booked')} style={{borderLeft: '4px solid #C0C0C0', maxWidth: '300px'}}>
          <h3>Booked Silver Orders</h3>
          <p>View and manage booked silver orders</p>
        </div>
        <div className="dashboard-card" onClick={() => navigateTo('/existing-orders-silver/closed')} style={{borderLeft: '4px solid #C0C0C0', maxWidth: '300px'}}>
          <h3>Closed Silver Orders</h3>
          <p>View completed silver orders</p>
        </div>
      </div>
    </div>
  )
}