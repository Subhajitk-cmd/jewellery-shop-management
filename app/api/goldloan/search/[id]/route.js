import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../../../lib/mongodb'
import { verifyToken } from '../../../../../lib/auth'

export async function GET(request, { params }) {
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
    const client = await clientPromise
    const db = client.db('jewelryshop')
    const goldLoans = db.collection('goldLoans')

    const loan = await goldLoans.findOne({ _id: new ObjectId(id) })
    if (!loan) {
      return NextResponse.json({ error: 'Gold loan not found' }, { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const updateData = await request.json()
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('jewelryshop')
    const goldLoans = db.collection('goldLoans')

    // Handle payment history for add amount
    if (updateData.newPaymentAmount) {
      const currentLoan = await goldLoans.findOne({ _id: new ObjectId(id) })
      const paymentHistory = currentLoan.paymentHistory || []
      paymentHistory.push({
        amount: parseFloat(updateData.newPaymentAmount),
        date: new Date(updateData.newPaymentDate || new Date()),
        type: 'payment'
      })
      
      await goldLoans.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentHistory: paymentHistory,
            updatedAt: new Date()
          }
        }
      )
    } else {
      // Regular update
      const allowedFields = ['customerName', 'customerAddress', 'date', 'itemName', 'itemWeight', 'loanAmount', 'interestValue', 'totalAmount', 'aadharId', 'status', 'totalAmountToBePaid']
      const updatedLoan = {}
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updatedLoan[field] = updateData[field]
        }
      })
      
      updatedLoan.updatedAt = new Date()
      
      // Add closure date when status changes to handed_over
      if (updateData.status === 'handed_over') {
        updatedLoan.closureDate = new Date()
      }

      const result = await goldLoans.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedLoan }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Gold loan not found' }, { status: 404 })
      }
    }



    return NextResponse.json({ message: 'Gold loan updated successfully' })
  } catch (error) {
    console.error('Gold loan update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const db = client.db('jewelryshop')
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