import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get user from token and IP for guest tracking
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Multiple IP detection methods for Vercel
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     request.ip ||
                     'unknown'
    
    let userId = null
    let userCallsUsed = 0
    let guestCallsUsed = 0
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const usageCollection = db.collection('api_usage')
    const today = new Date().toDateString()
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.userId
        
        // Check API usage limit for authenticated users (5 calls)
        const usage = await usageCollection.findOne({ userId, date: today })
        userCallsUsed = usage?.count || 0

        if (userCallsUsed >= 5) {
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
      } catch (jwtError) {
        userId = null
      }
    }
    
    // Check guest usage limit (2 calls per IP per day)
    if (!userId) {
      const guestId = `guest_${clientIP}`
      const guestUsage = await usageCollection.findOne({ guestId, date: today })
      guestCallsUsed = guestUsage?.count || 0
      
      if (guestCallsUsed >= 2) {
        return NextResponse.json({
          gold: 10000,
          gold22K: 10000,
          gold24K: 11000,
          silver: 850,
          lastUpdated: new Date().toISOString(),
          isRealTime: false,
          source: 'guest_limit_exceeded',
          unit: 'per gram',
          message: 'Daily guest limit exceeded (2 calls). Please login for more.'
        })
      }
    }

    // Fetch from MetalPriceAPI
    const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${process.env.METAL_PRICE_API_KEY}&base=INR&currencies=XAU,XAG`)
    
    if (response.ok) {
      const data = await response.json()
      
      const gold24K = Math.round((1 / data.rates.XAU) / 31.1035)
      const gold22K = Math.round(gold24K * 0.916)
      const silver = Math.round((1 / data.rates.XAG) / 31.1035)

      // Update usage count
      if (userId) {
        await usageCollection.updateOne(
          { userId, date: today },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      } else {
        const guestId = `guest_${clientIP}`
        await usageCollection.updateOne(
          { guestId, date: today },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      }

      return NextResponse.json({
        gold: gold22K,
        gold22K: gold22K,
        gold24K: gold24K,
        silver: silver,
        lastUpdated: new Date().toISOString(),
        isRealTime: true,
        source: 'metalpriceapi.com',
        unit: 'per gram',
        remainingCalls: userId ? (4 - userCallsUsed) : (1 - guestCallsUsed),
        debug: { clientIP, userId: !!userId }
      })
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