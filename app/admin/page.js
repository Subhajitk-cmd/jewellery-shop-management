'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { showNotification, showConfirmDialog } from '../components/ModernNotification'

export default function AdminPanel() {
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ userId: '', password: '' })
  const [masterAccounts, setMasterAccounts] = useState([])
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
      setIsAuthenticated(true)
      fetchAllUsers()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/admin/login', loginData)
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin))
      setIsAuthenticated(true)
      fetchAllUsers()
    } catch (error) {
      showNotification(error.response?.data?.error || 'Login failed', 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    setAllUsers([])
    setFilteredUsers([])
  }

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setAllUsers(response.data)
      filterUsers(response.data, statusFilter)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      if (error.response?.status === 401) {
        handleLogout()
      }
      setLoading(false)
    }
  }

  const filterUsers = (users, filter) => {
    if (filter === 'all') {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter(user => user.status === filter))
    }
  }

  const handleFilterChange = (filter) => {
    setStatusFilter(filter)
    filterUsers(allUsers, filter)
  }

  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.put('/api/admin/users', { userId, action }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      showNotification(`User ${action}d successfully!`, 'success')
      fetchAllUsers()
    } catch (error) {
      showNotification('Error processing request', 'error')
    }
  }

  const handleDeleteUser = async (userId) => {
    showConfirmDialog(
      'Are you sure you want to delete this user? This action cannot be undone.',
      async () => {
        try {
          const token = localStorage.getItem('adminToken')
          await axios.delete('/api/admin/users', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            data: { userId }
          })
          showNotification('User deleted successfully!', 'success')
          fetchAllUsers()
        } catch (error) {
          showNotification('Error deleting user', 'error')
        }
      }
    )
  }

  const fetchMasterAccounts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('/api/admin/master-accounts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setMasterAccounts(response.data)
    } catch (error) {
      console.error('Error fetching master accounts:', error)
    }
  }

  const handleUnlockMasterAccount = async (userId) => {
    showConfirmDialog(
      'Are you sure you want to unlock this master account?',
      async () => {
        try {
          const token = localStorage.getItem('adminToken')
          await axios.put('/api/admin/master-accounts', {
            userId,
            action: 'unlock'
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          showNotification('Master account unlocked successfully!', 'success')
          fetchMasterAccounts()
        } catch (error) {
          showNotification('Error unlocking master account', 'error')
        }
      }
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{padding: '2rem', maxWidth: '400px', margin: '0 auto'}}>
        <h1 style={{color: '#333', marginBottom: '2rem', textAlign: 'center'}}>Admin Login</h1>
        <form onSubmit={handleLogin} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>User ID:</label>
            <input
              type="text"
              value={loginData.userId}
              onChange={(e) => setLoginData({...loginData, userId: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Password:</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          <button type="submit" style={{
            width: '100%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            Login
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>
  }

  return (
    <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={{marginBottom: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h1 style={{color: '#333', margin: 0}}>Admin Panel</h1>
          <button onClick={handleLogout} style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
        
        {/* Navigation Blocks */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
          <div 
            onClick={() => setActiveSection('dashboard')}
            style={{
              padding: '1.5rem',
              backgroundColor: activeSection === 'dashboard' ? '#007bff' : '#f8f9fa',
              color: activeSection === 'dashboard' ? 'white' : '#333',
              border: '2px solid ' + (activeSection === 'dashboard' ? '#007bff' : '#dee2e6'),
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{margin: '0 0 0.5rem 0'}}>📊 Dashboard</h3>
            <p style={{margin: 0, fontSize: '0.9rem'}}>Overview & Statistics</p>
          </div>
          
          <div 
            onClick={() => setActiveSection('users')}
            style={{
              padding: '1.5rem',
              backgroundColor: activeSection === 'users' ? '#28a745' : '#f8f9fa',
              color: activeSection === 'users' ? 'white' : '#333',
              border: '2px solid ' + (activeSection === 'users' ? '#28a745' : '#dee2e6'),
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{margin: '0 0 0.5rem 0'}}>👥 User Management</h3>
            <p style={{margin: 0, fontSize: '0.9rem'}}>Approve, Reject & Delete Users</p>
          </div>
          
          <div 
            onClick={() => {
              setActiveSection('master')
              fetchMasterAccounts()
            }}
            style={{
              padding: '1.5rem',
              backgroundColor: activeSection === 'master' ? '#ffc107' : '#f8f9fa',
              color: activeSection === 'master' ? 'black' : '#333',
              border: '2px solid ' + (activeSection === 'master' ? '#ffc107' : '#dee2e6'),
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{margin: '0 0 0.5rem 0'}}>🔐 Master Accounts</h3>
            <p style={{margin: 0, fontSize: '0.9rem'}}>Unlock Locked Accounts</p>
          </div>
          
          <div 
            onClick={() => setActiveSection('reports')}
            style={{
              padding: '1.5rem',
              backgroundColor: activeSection === 'reports' ? '#17a2b8' : '#f8f9fa',
              color: activeSection === 'reports' ? 'white' : '#333',
              border: '2px solid ' + (activeSection === 'reports' ? '#17a2b8' : '#dee2e6'),
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{margin: '0 0 0.5rem 0'}}>📈 Reports</h3>
            <p style={{margin: 0, fontSize: '0.9rem'}}>Analytics & Reports</p>
          </div>
        </div>
      </div>
      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div>
          <h2 style={{marginBottom: '1.5rem', color: '#333'}}>📊 Dashboard Overview</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#e3f2fd',
              border: '2px solid #2196f3',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#1976d2'}}>Total Users</h3>
              <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1976d2'}}>{allUsers.length}</p>
            </div>
            
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff3e0',
              border: '2px solid #ff9800',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#f57c00'}}>Pending Approval</h3>
              <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f57c00'}}>{allUsers.filter(u => u.status === 'pending').length}</p>
            </div>
            
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#e8f5e8',
              border: '2px solid #4caf50',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#388e3c'}}>Approved Users</h3>
              <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#388e3c'}}>{allUsers.filter(u => u.status === 'approved').length}</p>
            </div>
            
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#ffebee',
              border: '2px solid #f44336',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#d32f2f'}}>Rejected Users</h3>
              <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f'}}>{allUsers.filter(u => u.status === 'rejected').length}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* User Management Section */}
      {activeSection === 'users' && (
        <div>
          <h2 style={{marginBottom: '1.5rem', color: '#333'}}>👥 User Management</h2>
          <div style={{marginBottom: '2rem'}}>
            <label style={{marginRight: '1rem', fontWeight: 'bold'}}>Filter by Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => handleFilterChange(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="all">All Users ({allUsers.length})</option>
              <option value="pending">Pending ({allUsers.filter(u => u.status === 'pending').length})</option>
              <option value="approved">Approved ({allUsers.filter(u => u.status === 'approved').length})</option>
              <option value="rejected">Rejected ({allUsers.filter(u => u.status === 'rejected').length})</option>
            </select>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h3>No users found</h3>
            <p>No users match the selected filter.</p>
          </div>
        ) : (
          <div>
            <h3 style={{marginBottom: '1rem'}}>Users ({filteredUsers.length})</h3>
            <div style={{display: 'grid', gap: '1rem'}}>
              {filteredUsers.map(user => (
                <div key={user._id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h3 style={{margin: '0 0 0.5rem 0', color: '#333'}}>{user.name}</h3>
                      <p style={{margin: '0 0 0.5rem 0', color: '#666'}}>{user.email}</p>
                      <p style={{margin: '0 0 0.5rem 0', color: '#666'}}>Phone: {user.phone}</p>
                      <p style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem'}}>
                        Status: <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          backgroundColor: user.status === 'approved' ? '#d4edda' : user.status === 'pending' ? '#fff3cd' : '#f8d7da',
                          color: user.status === 'approved' ? '#155724' : user.status === 'pending' ? '#856404' : '#721c24'
                        }}>{user.status || 'pending'}</span>
                      </p>
                      <p style={{margin: '0', fontSize: '0.9rem', color: '#888'}}>
                        Registered: {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      {user.status !== 'approved' && (
                        <button 
                          onClick={() => handleUserAction(user._id, 'approve')}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          {user.status === 'rejected' ? 'Re-approve' : 'Approve'}
                        </button>
                      )}
                      {user.status === 'pending' && (
                        <button 
                          onClick={() => handleUserAction(user._id, 'reject')}
                          style={{
                            backgroundColor: '#ffc107',
                            color: 'black',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Reject
                        </button>
                      )}
                      {user.status === 'approved' && (
                        <button 
                          onClick={() => handleUserAction(user._id, 'reject')}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Revoke Access
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
      
      {/* Master Accounts Section */}
      {activeSection === 'master' && (
        <div>
          <h2 style={{color: '#333', marginBottom: '1.5rem'}}>🔐 Master Account Management</h2>
          <div style={{display: 'grid', gap: '1rem'}}>
            {masterAccounts.map(account => (
              <div key={account._id} style={{
                backgroundColor: account.isLocked ? '#ffebee' : '#f8f9fa',
                border: `2px solid ${account.isLocked ? '#f44336' : '#28a745'}`,
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h3 style={{margin: '0 0 0.5rem 0', color: '#333'}}>{account.userDetails.name}</h3>
                    <p style={{margin: '0 0 0.5rem 0', color: '#666'}}>{account.userDetails.email}</p>
                    <p style={{margin: '0 0 0.5rem 0', color: '#666'}}>Failed Attempts: {account.failedAttempts || 0}</p>
                    {account.lastFailedAttempt && (
                      <p style={{margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem'}}>
                        Last Failed: {new Date(account.lastFailedAttempt).toLocaleString()}
                      </p>
                    )}
                    {account.lastLoginAt && (
                      <p style={{margin: '0', color: '#666', fontSize: '0.9rem'}}>
                        Last Login: {new Date(account.lastLoginAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: account.isLocked ? '#f44336' : '#28a745',
                      color: 'white'
                    }}>
                      {account.isLocked ? '🔒 LOCKED' : '🔓 ACTIVE'}
                    </span>
                    {account.isLocked && (
                      <button
                        onClick={() => handleUnlockMasterAccount(account.userId)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Unlock Account
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {masterAccounts.length === 0 && (
              <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>No master accounts found</p>
            )}
          </div>
        </div>
      )}
      
      {/* Reports Section */}
      {activeSection === 'reports' && (
        <div>
          <h2 style={{color: '#333', marginBottom: '1.5rem'}}>📈 Reports & Analytics</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{margin: '0 0 1rem 0', color: '#333'}}>User Registration Trends</h3>
              <p style={{color: '#666', marginBottom: '1rem'}}>Track user registration over time</p>
              <div style={{textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '4px'}}>
                <p style={{color: '#666'}}>Chart Coming Soon</p>
              </div>
            </div>
            
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{margin: '0 0 1rem 0', color: '#333'}}>Master Login Activity</h3>
              <p style={{color: '#666', marginBottom: '1rem'}}>Monitor master login attempts and locks</p>
              <div style={{textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '4px'}}>
                <p style={{color: '#666'}}>Activity Log Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}