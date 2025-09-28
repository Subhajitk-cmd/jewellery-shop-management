import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/auth'

export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelry-shop')
    const goldLoans = db.collection('goldLoans')

    const result = await goldLoans.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Gold loan not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Gold loan deleted successfully' })
  } catch (error) {
    console.error('Gold loan delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}