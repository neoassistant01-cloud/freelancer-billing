import { NextRequest, NextResponse } from 'next/server'
import { getInvoice } from '@/lib/db'

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = Buffer.from(auth.slice(7), 'base64').toString()
    return payload.split(':')[0]
  } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const invoice = getInvoice(userId, params.id)
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  
  return NextResponse.json({ invoice })
}
