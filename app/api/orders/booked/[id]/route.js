import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/auth'

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = params
    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const orders = db.collection('orders')

    const order = await orders.findOne({ _id: new ObjectId(id) })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const updateData = await request.json()
    const { id } = params

    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const orders = db.collection('orders')

    // Handle advance payment history
    if (updateData.newAdvanceAmount) {
      const currentOrder = await orders.findOne({ _id: new ObjectId(id) })
      const paymentHistory = currentOrder.paymentHistory || []
      paymentHistory.push({
        amount: parseFloat(updateData.newAdvanceAmount),
        date: new Date(),
        type: 'advance'
      })
      
      await orders.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            advance: updateData.advance,
            paymentHistory: paymentHistory,
            updatedAt: new Date()
          }
        }
      )
    } else {
      // Regular update
      const allowedFields = ['customerName', 'customerAddress', 'dateOfBooking', 'aadharId', 'itemName', 'itemEstimatedWeight', 'itemEstimatedValue', 'itemActualValue', 'itemActualWeight', 'advance', 'makingCharge', 'totalDue', 'customerPaid', 'dateOfDelivery', 'status']
      const updatedOrder = {}
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updatedOrder[field] = updateData[field]
        }
      })
      
      updatedOrder.updatedAt = new Date()

      await orders.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedOrder }
      )
    }

    return NextResponse.json({ message: 'Order updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}