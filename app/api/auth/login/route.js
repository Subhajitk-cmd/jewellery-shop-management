import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { verifyPassword, generateToken } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const users = db.collection('users')

    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 })
    }

    if (user.status === 'pending') {
      return NextResponse.json({ error: 'Account pending admin approval' }, { status: 403 })
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ error: 'Account has been rejected' }, { status: 403 })
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken(user._id)

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
