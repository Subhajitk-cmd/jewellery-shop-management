import { NextResponse } from 'next/server'
import { generateToken } from '../../../../lib/auth'

const ADMIN_CREDENTIALS = {
  userId: 'Subhajit',
  password: 'Subha@123'
}

export async function POST(request) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json({ error: 'User ID and password are required' }, { status: 400 })
    }

    if (userId !== ADMIN_CREDENTIALS.userId || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
    }

    const token = generateToken('admin')

    return NextResponse.json({
      message: 'Admin login successful',
      token,
      admin: {
        userId: ADMIN_CREDENTIALS.userId,
        role: 'admin'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}