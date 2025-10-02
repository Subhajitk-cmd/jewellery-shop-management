import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { hashPassword } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const users = db.collection('users')

    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    
    const result = await users.insertOne({
      name,
      email,
      phone,
      password: hashedPassword,
      status: 'pending',
      createdAt: new Date()
    })

    return NextResponse.json({ 
      message: 'Account created successfully! Please wait for admin approval to login.',
      userId: result.insertedId,
      status: 'pending'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
