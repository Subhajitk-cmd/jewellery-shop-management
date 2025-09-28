import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const pricesCollection = db.collection('prices')
    
    const priceData = await pricesCollection.findOne({ type: 'current' })
    
    const prices = {
      gold: priceData?.gold || 67500,
      silver: priceData?.silver || 850
    }
    
    return NextResponse.json(prices)
  } catch (error) {
    const prices = {
      gold: 67500,
      silver: 850
    }
    
    return NextResponse.json(prices)
  }
}