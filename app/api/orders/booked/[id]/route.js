import { NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/auth'
import { ObjectId } from 'mongodb'

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
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const orders = db.collection('orders')

    // Handle advance payment
    if (updateData.newAdvanceAmount) {
      const paymentEntry = {
        amount: updateData.newAdvanceAmount,
        date: updateData.newAdvanceDate ? new Date(updateData.newAdvanceDate) : new Date()
      }
      
      await orders.updateOne(
        { _id: new ObjectId(params.id), userId: decoded.userId },
        { 
          $set: { advance: updateData.advance },
          $push: { paymentHistory: paymentEntry }
        }
      )
    } else {
      // Regular update
      const { _id, ...dataToUpdate } = updateData
      await orders.updateOne(
        { _id: new ObjectId(params.id), userId: decoded.userId },
        { $set: dataToUpdate }
      )
    }

    return NextResponse.json({ message: 'Order updated successfully' })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log('Delete request for order:', params.id)
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('User ID from token:', decoded.userId)

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const orders = db.collection('orders')

    // First check if order exists
    const orderExists = await orders.findOne({ _id: new ObjectId(params.id) })
    console.log('Order exists:', orderExists ? 'Yes' : 'No')
    
    if (!orderExists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Delete the order (master login allows deleting any order)
    const result = await orders.deleteOne({ 
      _id: new ObjectId(params.id)
    })

    console.log('Delete result:', result)

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}