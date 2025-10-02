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
    const db = client.db('jewelry-shop')
    const masterAuth = db.collection('masterAuth')
    const users = db.collection('users')

    const masterAccounts = await masterAuth.aggregate([
      {
        $addFields: {
          userObjectId: { $toObjectId: '$userId' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          userId: 1,
          isLocked: 1,
          failedAttempts: 1,
          lastFailedAttempt: 1,
          lastLoginAt: 1,
          'userDetails.name': 1,
          'userDetails.email': 1
        }
      }
    ]).toArray()

    return NextResponse.json(masterAccounts)
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
    const db = client.db('jewelry-shop')
    const masterAuth = db.collection('masterAuth')

    if (action === 'unlock') {
      await masterAuth.updateOne(
        { userId: userId },
        { 
          $set: { 
            isLocked: false,
            failedAttempts: 0,
            unlockedAt: new Date()
          }
        }
      )
      
      return NextResponse.json({ message: 'Account unlocked successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}