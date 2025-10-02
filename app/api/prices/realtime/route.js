import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get user from token (optional)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let userId = null
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.userId
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message)
        // Continue without user ID - will use fallback prices
      }
    }

    // If user is authenticated, check API usage limit
    if (userId) {
      const client = await clientPromise
      const db = client.db('jewelryshop')
      const usageCollection = db.collection('api_usage')

      const today = new Date().toDateString()
      const usage = await usageCollection.findOne({ userId, date: today })

      if (usage && usage.count >= 5) {
        return NextResponse.json({
          gold: 10000,
          gold22K: 10000,
          gold24K: 11000,
          silver: 850,
          lastUpdated: new Date().toISOString(),
          isRealTime: false,
          source: 'limit_exceeded',
          unit: 'per gram',
          message: 'Daily API limit exceeded (5 calls)'
        })
      }

      // Fetch from MetalPriceAPI
      const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${process.env.METAL_PRICE_API_KEY}&base=INR&currencies=XAU,XAG`)
      
      if (response.ok) {
        const data = await response.json()
        
        const gold24K = Math.round((1 / data.rates.XAU) / 31.1035)
        const gold22K = Math.round(gold24K * 0.916)
        const silver = Math.round((1 / data.rates.XAG) / 31.1035)

        // Update usage count
        await usageCollection.updateOne(
          { userId, date: today },
          { $inc: { count: 1 } },
          { upsert: true }
        )

        return NextResponse.json({
          gold: gold22K,
          gold22K: gold22K,
          gold24K: gold24K,
          silver: silver,
          lastUpdated: new Date().toISOString(),
          isRealTime: true,
          source: 'metalpriceapi.com',
          unit: 'per gram',
          remainingCalls: 4 - (usage?.count || 0)
        })
      }
    }
  } catch (error) {
    console.error('API error:', error)
  }
  
  return NextResponse.json({
    gold: 10000,
    gold22K: 10000,
    gold24K: 11000,
    silver: 850,
    lastUpdated: new Date().toISOString(),
    isRealTime: false,
    source: 'fallback',
    unit: 'per gram'
  })
}