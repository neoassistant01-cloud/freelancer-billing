import { NextRequest, NextResponse } from 'next/server'
import { getTimeEntries, createTimeEntry } from '@/lib/db'

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
  
  const entries = getTimeEntries(userId)
  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const data = await req.json()
    const entry = createTimeEntry(userId, data)
    return NextResponse.json({ entry })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}
