import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const prices = db.collection('prices')
    
    // Get all price documents
    const allPrices = await prices.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      allPrices,
      dbName: db.databaseName
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
    
    // Force insert test data
    const result = await prices.replaceOne(
      { type: 'current' },
      { 
        type: 'current',
        gold: 70000,
        silver: 900,
        updatedAt: new Date(),
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
