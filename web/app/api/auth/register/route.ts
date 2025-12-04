import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

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

    // Call the FastAPI backend to register
    const registerResponse = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    })

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Registration failed' },
        { status: registerResponse.status }
      )
    }

    const userData = await registerResponse.json()

    // Now login to get the token
    const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!loginResponse.ok) {
      return NextResponse.json(
        { detail: 'Registration successful but login failed' },
        { status: 500 }
      )
    }

    const { access_token } = await loginResponse.json()

    // Set httpOnly cookie with the JWT token
    const cookieStore = await cookies()
    cookieStore.set('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: userData,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
