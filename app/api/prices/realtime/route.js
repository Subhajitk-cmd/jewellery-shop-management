import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch prices from MetalPriceAPI.com
    const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${process.env.METAL_PRICE_API_KEY}&base=INR&currencies=XAU,XAG`)
    
    if (response.ok) {
      const data = await response.json()
      
      // Convert from per ounce to per gram and calculate prices
      const gold24K = Math.round((1 / data.rates.XAU) / 31.1035)
      const gold22K = Math.round(gold24K * 0.916) // 22K is 91.6% pure
      const silver = Math.round((1 / data.rates.XAG) / 31.1035)
      
      return NextResponse.json({
        gold: gold22K,
        gold22K: gold22K,
        gold24K: gold24K,
        silver: silver,
        lastUpdated: new Date().toISOString(),
        isRealTime: true,
        source: 'metalpriceapi.com',
        unit: 'per gram'
      })
    }
  } catch (error) {
    console.error('MetalPriceAPI error:', error)
  }
  
  // Fallback to fixed prices
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