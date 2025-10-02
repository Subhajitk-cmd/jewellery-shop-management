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
    const goldPrice = parseFloat(gold)
    const silverPrice = parseFloat(silver)
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const prices = db.collection('prices')

    // Use replaceOne with upsert for better Vercel compatibility
    const result = await prices.replaceOne(
      { _id: 'current_prices' },
      {
        _id: 'current_prices',
        type: 'current',
        gold: goldPrice,
        silver: silverPrice,
        updatedAt: new Date(),
        timestamp: Date.now()
      },
      { upsert: true }
    )
    
    return NextResponse.json({ 
      message: 'Prices updated successfully',
      gold: goldPrice,
      silver: silverPrice,
      result: result.acknowledged
    })
  } catch (error) {
    console.error('Price update error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
