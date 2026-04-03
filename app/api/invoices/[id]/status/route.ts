import { NextRequest, NextResponse } from 'next/server'
import { updateInvoiceStatus } from '@/lib/db'

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = Buffer.from(auth.slice(7), 'base64').toString()
    return payload.split(':')[0]
  } catch { return null }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const { status } = await req.json()
    if (!['draft', 'sent', 'paid'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    
    const invoice = updateInvoiceStatus(userId, params.id, status)
    return NextResponse.json({ invoice })
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    if (err.message === 'INVALID_STATUS_TRANSITION') {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
