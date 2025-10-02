import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { sendOTPConsole } from '../../../../lib/emailService'

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const users = db.collection('users')

    const existingUser = await users.findOne({ 
      $or: [{ email }, { phone }] 
    })
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }
      if (existingUser.phone === phone) {
        return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 })
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    const otpData = {
      email,
      phone,
      name,
      password,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
    
    const otpCollection = db.collection('otpVerification')
    await otpCollection.deleteMany({ email })
    await otpCollection.insertOne(otpData)

    // Show OTP directly for testing
    console.log(`📧 Generated OTP ${otp} for ${email}`)
    
    return NextResponse.json({ 
      message: `Your OTP is: ${otp}. Please use this to verify your email.`,
      email: email,
      otp: otp
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}