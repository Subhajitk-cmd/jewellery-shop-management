import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Fetch prices from MetalPriceAPI.com
    const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${process.env.METAL_PRICE_API_KEY}&base=INR&currencies=XAU,XAG`)
    
    if (response.ok) {
      const data = await response.json()
      
      // Convert from per ounce to per gram
      const gold = Math.round((1 / data.rates.XAU) / 31.1035)
      const silver = Math.round((1 / data.rates.XAG) / 31.1035)
      
      return NextResponse.json({
        gold: gold,
        silver: silver,
        lastUpdated: new Date().toISOString(),
        source: 'metalpriceapi.com'
      })
    }
  } catch (error) {
    console.error('MetalPriceAPI error:', error)
  }
  
  // Fallback to fixed prices
  return NextResponse.json({
    gold: 11000,
    silver: 850,
    source: 'fallback'
  })
}