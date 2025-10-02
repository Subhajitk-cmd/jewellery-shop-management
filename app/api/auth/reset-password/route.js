import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { hashPassword } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const users = db.collection('users')

    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check OTP validity
    if (!user.resetOtp || user.resetOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    if (!user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear OTP
    await users.updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword
        },
        $unset: {
          resetOtp: "",
          resetOtpExpiry: ""
        }
      }
    )

    return NextResponse.json({ 
      message: 'Password reset successfully! You can now login with your new password.' 
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}