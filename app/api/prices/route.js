import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Return fixed prices to avoid external API issues on Vercel
  return NextResponse.json({
    gold: 11000,
    silver: 850,
    lastUpdated: new Date().toISOString(),
    source: 'fixed'
  })
}