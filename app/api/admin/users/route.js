import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const users = db.collection('users')

    const allUsers = await users
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(allUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const users = db.collection('users')

    const status = action === 'approve' ? 'approved' : 'rejected'
    
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      message: `User ${status} successfully`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()
    
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const users = db.collection('users')

    await users.deleteOne({ _id: new ObjectId(userId) })

    return NextResponse.json({ 
      message: 'User deleted successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
