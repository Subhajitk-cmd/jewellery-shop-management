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
    console.log('Updating prices:', { gold, silver })

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const prices = db.collection('prices')

    const result = await prices.updateOne(
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

    console.log('Update result:', result)
    return NextResponse.json({ 
      message: 'Prices updated successfully',
      gold: parseFloat(gold),
      silver: parseFloat(silver)
    })
  } catch (error) {
    console.error('Price update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}