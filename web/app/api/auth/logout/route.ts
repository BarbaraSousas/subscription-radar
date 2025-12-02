import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')

    // TODO: Once backend is integrated, you might want to invalidate the token on the server:
    // await fetch(`${process.env.BACKEND_URL}/api/v1/auth/logout`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // })

    return NextResponse.json({
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { detail: 'Logout failed' },
      { status: 500 }
    )
  }
}
