import { NextRequest, NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/db'

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
  
  const clients = getClients(userId)
  return NextResponse.json({ clients })
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const data = await req.json()
    const client = createClient(userId, data)
    return NextResponse.json({ client })
  } catch (err: any) {
    if (err.message === 'REQUIRED_NAME') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
