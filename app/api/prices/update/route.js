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
    
    console.log('Updating prices:', { gold: goldPrice, silver: silverPrice })

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const prices = db.collection('prices')

    // Delete existing price document and insert new one
    await prices.deleteMany({ type: 'current' })
    const result = await prices.insertOne({
      type: 'current',
      gold: goldPrice,
      silver: silverPrice,
      updatedAt: new Date(),
      timestamp: Date.now()
    })

    console.log('Insert result:', result)
    
    // Verify the data was saved
    const savedData = await prices.findOne({ type: 'current' })
    console.log('Verified saved data:', savedData)
    
    return NextResponse.json({ 
      message: 'Prices updated successfully',
      gold: goldPrice,
      silver: silverPrice,
      saved: savedData
    })
  } catch (error) {
    console.error('Price update error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
