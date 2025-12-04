import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

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

    // Call the FastAPI backend to authenticate
    const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Invalid credentials' },
        { status: loginResponse.status }
      )
    }

    const { access_token } = await loginResponse.json()

    // Fetch user data using the token
    const userResponse = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { detail: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const userData = await userResponse.json()

    // Set httpOnly cookie with the JWT token
    const cookieStore = await cookies()
    cookieStore.set('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      message: 'Login successful',
      user: userData,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    )
  }
}
