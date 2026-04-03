import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = createUser(email, password)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    
    return NextResponse.json({ user, token })
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
