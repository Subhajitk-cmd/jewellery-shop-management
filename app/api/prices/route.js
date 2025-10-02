import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const pricesCollection = db.collection('prices')
    
    // Get the most recent price data
    const priceData = await pricesCollection.findOne(
      { type: 'current' },
      { sort: { timestamp: -1 } }
    )
    console.log('Retrieved price data:', priceData)
    
    const prices = {
      gold: priceData?.gold || 67500,
      silver: priceData?.silver || 850,
      lastUpdated: priceData?.updatedAt,
      fromDatabase: !!priceData
    }
    
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Price fetch error:', error)
    const prices = {
      gold: 67500,
      silver: 850,
      fromDatabase: false,
      error: error.message
    }
    
    return NextResponse.json(prices)
  }
}
