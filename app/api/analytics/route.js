import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { verifyToken } from '../../../lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear()
    const viewType = url.searchParams.get('view') || 'monthly'
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const orders = db.collection('orders')
    const goldLoans = db.collection('goldLoans')
    
    // Get time periods based on view type
    const periods = []
    if (viewType === 'yearly') {
      // Show last 5 years
      for (let i = 4; i >= 0; i--) {
        const yearValue = year - i
        periods.push({
          name: yearValue.toString(),
          year: yearValue,
          isYearly: true
        })
      }
    } else {
      // Show all 12 months for selected year
      for (let i = 0; i < 12; i++) {
        const date = new Date(year, i, 1)
        periods.push({
          name: date.toLocaleString('default', { month: 'short' }),
          year: year,
          month: i,
          isYearly: false
        })
      }
    }

    // Sales calculation based on view type
    const monthlySales = await Promise.all(
      periods.map(async (p) => {
        let startDate, endDate
        if (p.isYearly) {
          startDate = new Date(p.year, 0, 1)
          endDate = new Date(p.year, 11, 31, 23, 59, 59, 999)
        } else {
          startDate = new Date(p.year, p.month, 1)
          endDate = new Date(p.year, p.month + 1, 0, 23, 59, 59, 999)
        }
        
        let salesData
        if (viewType === 'yearly') {
          // Yearly: Use itemActualValue and dateOfDelivery for closed orders
          salesData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                status: 'closed',
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                deliveryDate: { $dateFromString: { dateString: "$dateOfDelivery" } }
              }
            },
            {
              $match: {
                deliveryDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: { $toDouble: '$itemActualValue' } }
              }
            }
          ]).toArray()

        } else {
          // Monthly: Use itemEstimatedValue and dateOfBooking
          salesData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                bookingDate: { $dateFromString: { dateString: "$dateOfBooking" } }
              }
            },
            {
              $match: {
                bookingDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: { $toDouble: '$itemEstimatedValue' } }
              }
            }
          ]).toArray()
        }
        
        const salesValue = salesData[0]?.totalSales || 0

        return {
          month: p.name,
          value: salesValue
        }
      })
    )

    // Orders calculation based on view type
    const monthlyOrders = await Promise.all(
      periods.map(async (p) => {
        let startDate, endDate
        if (p.isYearly) {
          startDate = new Date(p.year, 0, 1)
          endDate = new Date(p.year, 11, 31, 23, 59, 59, 999)
        } else {
          startDate = new Date(p.year, p.month, 1)
          endDate = new Date(p.year, p.month + 1, 0, 23, 59, 59, 999)
        }
        
        let orderData
        if (viewType === 'yearly') {
          // Yearly: Count closed orders by dateOfDelivery
          orderData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                status: 'closed',
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                deliveryDate: { $dateFromString: { dateString: "$dateOfDelivery" } }
              }
            },
            {
              $match: {
                deliveryDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $count: "orderCount"
            }
          ]).toArray()
        } else {
          // Monthly: Count all orders by dateOfBooking
          orderData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                bookingDate: { $dateFromString: { dateString: "$dateOfBooking" } }
              }
            },
            {
              $match: {
                bookingDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $count: "orderCount"
            }
          ]).toArray()
        }
        
        const orderCount = orderData[0]?.orderCount || 0

        return {
          month: p.name,
          value: orderCount
        }
      })
    )

    // Loans calculation based on view type
    const monthlyLoans = await Promise.all(
      periods.map(async (p) => {
        let startDate, endDate
        if (p.isYearly) {
          startDate = new Date(p.year, 0, 1)
          endDate = new Date(p.year, 11, 31, 23, 59, 59, 999)
        } else {
          startDate = new Date(p.year, p.month, 1)
          endDate = new Date(p.year, p.month + 1, 0, 23, 59, 59, 999)
        }
        
        const loanCount = await goldLoans.countDocuments({
          userId: decoded.userId,
          $or: [
            { metalType: { $exists: false } },
            { metalType: 'gold' },
            { metalType: null }
          ],
          status: 'handed_over',
          updatedAt: {
            $gte: startDate,
            $lte: endDate
          }
        })

        return {
          month: p.name,
          value: loanCount
        }
      })
    )

    // Loan amount calculation based on view type - summation of loanAmount
    const monthlyLoanAmount = await Promise.all(
      periods.map(async (p) => {
        let startDate, endDate
        if (p.isYearly) {
          startDate = new Date(p.year, 0, 1)
          endDate = new Date(p.year, 11, 31, 23, 59, 59, 999)
        } else {
          startDate = new Date(p.year, p.month, 1)
          endDate = new Date(p.year, p.month + 1, 0, 23, 59, 59, 999)
        }
        
        const loanData = await goldLoans.aggregate([
          {
            $match: {
              userId: decoded.userId,
              $or: [
                { metalType: { $exists: false } },
                { metalType: 'gold' },
                { metalType: null }
              ]
            }
          },
          {
            $addFields: {
              loanDate: { $dateFromString: { dateString: "$date" } }
            }
          },
          {
            $match: {
              loanDate: {
                $gte: startDate,
                $lte: endDate
              }
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $toDouble: '$loanAmount' } }
            }
          }
        ]).toArray()

        return {
          month: p.name,
          value: loanData[0]?.totalAmount || 0
        }
      })
    )

    // Making charge calculation based on view type
    const monthlyMakingCharge = await Promise.all(
      periods.map(async (p) => {
        let startDate, endDate
        if (p.isYearly) {
          startDate = new Date(p.year, 0, 1)
          endDate = new Date(p.year, 11, 31, 23, 59, 59, 999)
        } else {
          startDate = new Date(p.year, p.month, 1)
          endDate = new Date(p.year, p.month + 1, 0, 23, 59, 59, 999)
        }
        
        let makingChargeData
        if (viewType === 'yearly') {
          // Yearly: Use actualMakingCharge from closed orders by dateOfDelivery
          makingChargeData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                status: 'closed',
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                deliveryDate: { $dateFromString: { dateString: "$dateOfDelivery" } }
              }
            },
            {
              $match: {
                deliveryDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $group: {
                _id: null,
                totalMakingCharge: { $sum: { $toDouble: '$actualMakingCharge' } }
              }
            }
          ]).toArray()
        } else {
          // Monthly: Use makingCharge from all orders by dateOfBooking
          makingChargeData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                bookingDate: { $dateFromString: { dateString: "$dateOfBooking" } }
              }
            },
            {
              $match: {
                bookingDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $group: {
                _id: null,
                totalMakingCharge: { $sum: { $toDouble: '$makingCharge' } }
              }
            }
          ]).toArray()
        }
        
        const makingChargeValue = makingChargeData[0]?.totalMakingCharge || 0

        return {
          month: p.name,
          value: makingChargeValue
        }
      })
    )

    // Total due amount calculation (only for yearly view)
    let monthlyTotalDue = []
    if (viewType === 'yearly') {
      monthlyTotalDue = await Promise.all(
        periods.map(async (p) => {
          let startDate, endDate
          startDate = new Date(p.year, 0, 1)
          endDate = new Date(p.year, 11, 31, 23, 59, 59, 999)
          
          const totalDueData = await orders.aggregate([
            {
              $match: {
                userId: decoded.userId,
                status: 'closed',
                $or: [
                  { metalType: { $exists: false } },
                  { metalType: 'gold' },
                  { metalType: null }
                ]
              }
            },
            {
              $addFields: {
                deliveryDate: { $dateFromString: { dateString: "$dateOfDelivery" } }
              }
            },
            {
              $match: {
                deliveryDate: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            },
            {
              $group: {
                _id: null,
                totalDueAmount: { 
                  $sum: { 
                    $subtract: [
                      { $toDouble: '$itemActualValue' },
                      { $add: [
                        { $toDouble: '$advance' },
                        { $toDouble: '$customerPaid' }
                      ]}
                    ]
                  }
                }
              }
            }
          ]).toArray()
          
          return {
            month: p.name,
            value: totalDueData[0]?.totalDueAmount || 0
          }
        })
      )
    }

    return NextResponse.json({
      monthlySales,
      monthlyOrders,
      monthlyLoans,
      monthlyLoanAmount,
      monthlyMakingCharge,
      monthlyTotalDue
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
