import { NextRequest, NextResponse } from 'next/server'
import { getClient, updateClient, deleteClient } from '@/lib/db'

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
  
  const client = getClient(userId, params.id)
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  
  return NextResponse.json({ client })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const data = await req.json()
    const client = updateClient(userId, params.id, data)
    return NextResponse.json({ client })
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const deleted = deleteClient(userId, params.id)
  if (!deleted) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  
  return NextResponse.json({ success: true })
}
