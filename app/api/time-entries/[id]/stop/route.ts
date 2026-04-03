import { NextRequest, NextResponse } from 'next/server'
import { stopTimeEntry } from '@/lib/db'

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = Buffer.from(auth.slice(7), 'base64').toString()
    return payload.split(':')[0]
  } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const entry = stopTimeEntry(userId, params.id)
    return NextResponse.json({ entry })
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to stop timer' }, { status: 500 })
  }
}
