import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// TODO: Replace with actual backend API call when integrated
// For now, this is mock mode that accepts any registration
export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (password.length > 72) {
      return NextResponse.json(
        { detail: 'Password must be at most 72 characters' },
        { status: 400 }
      )
    }

    // TODO: Once backend is integrated, make actual API call:
    // const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, full_name }),
    // })
    // if (!response.ok) throw new Error('Registration failed')
    // const data = await response.json()

    // MOCK MODE: Accept any registration for development
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

    return NextResponse.json(
      {
        message: 'Registration successful (mock mode)',
        user: {
          id: 1,
          email,
          full_name: full_name || 'Mock User',
          is_active: true,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { detail: 'Registration failed' },
      { status: 500 }
    )
  }
}
