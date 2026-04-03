import { NextRequest, NextResponse } from 'next/server'
import { verifyUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = verifyUser(email, password)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    
    return NextResponse.json({ user, token })
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
