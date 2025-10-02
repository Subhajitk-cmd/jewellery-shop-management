import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Return fixed prices to avoid external API issues on Vercel
  return NextResponse.json({
    gold: 10000,
    gold22K: 10000,
    gold24K: 11000,
    silver: 850,
    lastUpdated: new Date().toISOString(),
    isRealTime: false,
    source: 'fixed',
    unit: 'per gram'
  })
}