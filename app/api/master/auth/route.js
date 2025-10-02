import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { hashPassword, verifyPassword } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { action, password, newPassword, email, otp, userId } = await request.json()

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const masterAuth = db.collection('masterAuth')

    if (action === 'login') {
      let masterRecord = await masterAuth.findOne({ userId: userId })
      
      if (!masterRecord) {
        const hashedPassword = await hashPassword('master123')
        await masterAuth.insertOne({
          userId: userId,
          password: hashedPassword,
          isTemporary: true,
          failedAttempts: 0,
          isLocked: false,
          createdAt: new Date()
        })
        masterRecord = { password: hashedPassword, isTemporary: true, failedAttempts: 0, isLocked: false }
      }

      // Check if account is locked
      if (masterRecord.isLocked) {
        return NextResponse.json({ 
          error: 'Account is locked due to multiple failed attempts. Contact admin to unlock.' 
        }, { status: 423 })
      }

      const isValid = await verifyPassword(password, masterRecord.password)
      if (!isValid) {
        const newFailedAttempts = (masterRecord.failedAttempts || 0) + 1
        const shouldLock = newFailedAttempts >= 3
        
        await masterAuth.updateOne(
          { userId: userId },
          { 
            $set: { 
              failedAttempts: newFailedAttempts,
              isLocked: shouldLock,
              lastFailedAttempt: new Date()
            }
          }
        )
        
        if (shouldLock) {
          return NextResponse.json({ 
            error: 'Account locked after 3 failed attempts. Contact admin to unlock.' 
          }, { status: 423 })
        }
        
        return NextResponse.json({ 
          error: `Invalid password. ${3 - newFailedAttempts} attempts remaining.` 
        }, { status: 401 })
      }

      // Reset failed attempts on successful login
      await masterAuth.updateOne(
        { userId: userId },
        { 
          $set: { 
            failedAttempts: 0,
            lastLoginAt: new Date()
          }
        }
      )

      return NextResponse.json({ 
        success: true, 
        isTemporary: masterRecord.isTemporary || false 
      })
    }

    if (action === 'changePassword') {
      const hashedNewPassword = await hashPassword(newPassword)
      
      await masterAuth.updateOne(
        { userId: userId },
        { 
          $set: { 
            password: hashedNewPassword, 
            isTemporary: false,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )

      return NextResponse.json({ success: true })
    }

    if (action === 'forgotPassword') {
      // Check if email matches any approved user
      const users = db.collection('users')
      
      // First check if email exists at all
      const anyUser = await users.findOne({ email: email })
      console.log(`Checking email: ${email}`)
      console.log('Email exists:', anyUser ? 'Yes' : 'No')
      if (anyUser) {
        console.log('User status:', anyUser.status)
      }
      
      const user = await users.findOne({ 
        email: email, 
        status: 'approved' 
      })
      console.log('Found approved user:', user ? 'Yes' : 'No')
      
      if (!user) {
        if (!anyUser) {
          return NextResponse.json({ 
            error: 'Email address not found. Please check your email or sign up first.' 
          }, { status: 400 })
        } else {
          return NextResponse.json({ 
            error: `Account status: ${anyUser.status}. Only approved accounts can reset password.` 
          }, { status: 400 })
        }
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      
      await masterAuth.updateOne(
        { userId: userId },
        { 
          $set: { 
            resetOtp: otp,
            resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
            resetEmail: email
          }
        },
        { upsert: true }
      )

      console.log(`Master Reset OTP for ${email}: ${otp}`)
      
      return NextResponse.json({ 
        success: true, 
        message: `Reset OTP: ${otp}`,
        otp: otp
      })
    }

    if (action === 'resetPassword') {
      const masterRecord = await masterAuth.findOne({ userId: userId })
      
      if (!masterRecord || 
          masterRecord.resetOtp !== otp || 
          new Date() > masterRecord.resetOtpExpiry) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
      }

      const hashedNewPassword = await hashPassword(newPassword)
      
      await masterAuth.updateOne(
        { userId: userId },
        { 
          $set: { 
            password: hashedNewPassword,
            isTemporary: false
          },
          $unset: { 
            resetOtp: "",
            resetOtpExpiry: "",
            resetEmail: ""
          }
        }
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
