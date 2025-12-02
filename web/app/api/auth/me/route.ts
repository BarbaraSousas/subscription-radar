import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// TODO: Replace with actual backend API call when integrated
// For now, this is mock mode that returns a mock user if token exists
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    // Check if user is authenticated
    if (!token) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }

    // TODO: Once backend is integrated, validate token and fetch user:
    // const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/me`, {
    //   headers: {
    //     'Authorization': `Bearer ${token.value}`,
    //   },
    // })
    // if (!response.ok) throw new Error('Failed to fetch user')
    // return NextResponse.json(await response.json())

    // MOCK MODE: Return mock user data
    return NextResponse.json({
      id: 1,
      email: 'user@example.com',
      full_name: 'Mock User',
      is_active: true,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { detail: 'Not authenticated' },
      { status: 401 }
    )
  }
}
