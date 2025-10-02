import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { hashPassword } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const otpCollection = db.collection('otpVerification')

    const otpRecord = await otpCollection.findOne({ 
      email, 
      otp,
      expiresAt: { $gt: new Date() }
    })

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(otpRecord.password)
    
    const users = db.collection('users')
    const result = await users.insertOne({
      name: otpRecord.name,
      email: otpRecord.email,
      phone: otpRecord.phone,
      password: hashedPassword,
      status: 'pending',
      createdAt: new Date()
    })

    await otpCollection.deleteOne({ _id: otpRecord._id })

    return NextResponse.json({ 
      message: 'Account created successfully! Please wait for admin approval to login.',
      userId: result.insertedId,
      status: 'pending'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}