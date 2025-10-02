import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const pricesCollection = db.collection('prices')
    
    const priceData = await pricesCollection.findOne({ type: 'current' })
    console.log('Retrieved price data:', priceData)
    
    const prices = {
      gold: priceData?.gold || 67500,
      silver: priceData?.silver || 850
    }
    
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Price fetch error:', error)
    const prices = {
      gold: 67500,
      silver: 850
    }
    
    return NextResponse.json(prices)
  }
}
