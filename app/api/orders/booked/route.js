import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { verifyToken } from '../../../../lib/auth'

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

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const orders = db.collection('orders')

    const url = new URL(request.url)
    const metalType = url.searchParams.get('metalType')
    
    let filter = { status: 'booked', userId: decoded.userId }
    
    if (metalType === 'gold') {
      filter.$or = [
        { metalType: { $exists: false } },
        { metalType: 'gold' },
        { metalType: null }
      ]
    } else if (metalType === 'silver') {
      filter.metalType = 'silver'
    }

    const bookedOrders = await orders
      .find(filter)
      .sort({ dateOfBooking: -1 })
      .toArray()

    return NextResponse.json(bookedOrders)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
