import { NextRequest, NextResponse } from 'next/server'
import { getInvoices, createInvoice } from '@/lib/db'

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = Buffer.from(auth.slice(7), 'base64').toString()
    return payload.split(':')[0]
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const invoices = getInvoices(userId)
  return NextResponse.json({ invoices })
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const data = await req.json()
    const invoice = createInvoice(userId, data)
    return NextResponse.json({ invoice })
  } catch (err: any) {
    if (err.message === 'REQUIRED_CLIENT') {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }
    if (err.message === 'NO_LINE_ITEMS') {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
    }
    if (err.message === 'INVALID_CLIENT') {
      return NextResponse.json({ error: 'Invalid client' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
