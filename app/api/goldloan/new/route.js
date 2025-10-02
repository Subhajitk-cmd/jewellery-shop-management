import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { verifyToken } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const loanData = await request.json()
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const goldLoans = db.collection('goldLoans')

    const newLoan = {
      ...loanData,
      status: 'pending',
      userId: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await goldLoans.insertOne(newLoan)

    return NextResponse.json({ 
      message: 'Gold loan application submitted successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
