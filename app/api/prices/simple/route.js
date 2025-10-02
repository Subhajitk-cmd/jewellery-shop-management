import { NextResponse } from 'next/server'

let priceCache = {
  gold: 67500,
  silver: 850,
  lastUpdated: new Date().toISOString()
}

export async function GET() {
  return NextResponse.json(priceCache)
}

export async function POST(request) {
  try {
    const { gold, silver } = await request.json()
    
    priceCache = {
      gold: parseFloat(gold),
      silver: parseFloat(silver),
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json({ 
      message: 'Prices updated successfully',
      ...priceCache
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}