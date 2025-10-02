import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { verifyToken } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const orderData = await request.json()
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const orders = db.collection('orders')

    // Generate unique order ID
    const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()

    const newOrder = {
      ...orderData,
      orderId,
      userId: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await orders.insertOne(newOrder)

    return NextResponse.json({ 
      message: 'Order created successfully',
      orderId 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
