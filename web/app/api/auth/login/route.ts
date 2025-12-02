import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// TODO: Replace with actual backend API call when integrated
// For now, this is mock mode that accepts any credentials
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      )
    }

    // TODO: Once backend is integrated, make actual API call:
    // const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // })
    // if (!response.ok) throw new Error('Login failed')
    // const data = await response.json()

    // MOCK MODE: Accept any credentials for development
    const mockToken = 'mock-jwt-token-' + Date.now()

    // Set httpOnly cookie with the token
    const cookieStore = await cookies()
    cookieStore.set('auth_token', mockToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      message: 'Login successful (mock mode)',
      user: {
        id: 1,
        email,
        full_name: 'Mock User',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    )
  }
}
