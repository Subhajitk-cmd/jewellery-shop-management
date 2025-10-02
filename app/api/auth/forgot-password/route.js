import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const users = db.collection('users')

    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 })
    }

    if (user.status !== 'approved') {
      return NextResponse.json({ error: 'Account not approved. Please contact admin.' }, { status: 403 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    await users.updateOne(
      { email },
      { 
        $set: { 
          resetOtp: otp,
          resetOtpExpiry: otpExpiry
        }
      }
    )

    // For now, display OTP directly (in production, send via email)
    return NextResponse.json({ 
      message: 'Email service temporarily unavailable. Your OTP is displayed below.',
      otp: otp
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
