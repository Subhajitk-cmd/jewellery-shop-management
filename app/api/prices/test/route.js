import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const prices = db.collection('prices')
    
    // Get all price documents
    const allPrices = await prices.find({}).toArray()
    const currentPrice = await prices.findOne({ _id: 'current_prices' })
    
    return NextResponse.json({
      success: true,
      allPrices,
      currentPrice,
      dbName: db.databaseName,
      connectionString: process.env.MONGODB_URI ? 'Set' : 'Not set'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const prices = db.collection('prices')
    
    // Force insert test data with fixed _id
    const result = await prices.replaceOne(
      { _id: 'current_prices' },
      { 
        _id: 'current_prices',
        type: 'current',
        gold: 70000,
        silver: 900,
        updatedAt: new Date(),
        timestamp: Date.now(),
        testInsert: true
      },
      { upsert: true }
    )
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Test data inserted'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
