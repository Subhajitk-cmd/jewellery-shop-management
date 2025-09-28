import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { verifyToken } from '../../../../lib/auth'

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { gold, silver } = await request.json()

    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const prices = db.collection('prices')

    await prices.updateOne(
      { type: 'current' },
      { 
        $set: { 
          gold: parseFloat(gold), 
          silver: parseFloat(silver),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ message: 'Prices updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}